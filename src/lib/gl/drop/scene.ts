import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { Water } from 'three/addons/objects/Water2.js';
import type { MotionTier } from '../../motion/prefs';

/**
 * "The Drop" — rebuilt from the Peach Worlds scene state using their original
 * assets (used with permission): rock, hand, ring and animated sphere GLBs,
 * the studio EXR environment, the looping gradient video, and flow-map water.
 *
 * Timeline (0..1 = scroll progress), from sceneState.json:
 *   camera  y 11.42 → 1.47 (@.661) → -0.43, z 4 → 5.32 at the end
 *   sphere  y 11.71 → -0.57; scale 1 → .5 (@.06) hold → 1.05 (@.904)
 *   sphere  emissive black → white between .277 and .323 (video map)
 *   ring2   rotation.z -2.324 → -0.897 between .191 and .349
 *   hand    rises from (-3.28,-3.43,.29) to (-4.03,-1.79,.33) between .744 and .931
 */

type Key = [number, number, number[]?];

function ease(h: number[] | undefined, t: number) {
  if (!h || (h[0] === 1 && h[1] === 1)) return t;
  const [x1, y1, x2, y2] = h;
  let u = t;
  for (let i = 0; i < 8; i++) {
    const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
    const dx = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
    if (Math.abs(dx) < 1e-6) break;
    u = Math.min(1, Math.max(0, u - (x - t) / dx));
  }
  return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
}
function track(keys: Key[]) {
  return (p: number) => {
    if (p <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (p <= keys[i][0]) {
        const [p0, v0] = keys[i - 1];
        const [p1, v1, h] = keys[i];
        return v0 + (v1 - v0) * ease(h, (p - p0) / (p1 - p0));
      }
    }
    return keys[keys.length - 1][1];
  };
}
const EASE = [0.58, 1, 0, 0];
const camX = track([[0, -3.352], [0.661, -3.206], [1, -3.178, EASE]]);
const camY = track([[0, 11.419], [0.661, 1.473], [1, -0.434, EASE]]);
const camZ = track([[0, 4], [0.661, 4], [1, 5.317, EASE]]);
const sphX = track([[0, -3.362], [1, -3.216, EASE]]);
const sphY = track([[0, 11.71], [1, -0.57, EASE]]);
const sphS = track([[0, 1], [0.06, 0.5, EASE], [0.602, 0.5], [0.904, 1.05, EASE], [1, 1.05]]);
const sphGlow = track([[0.277, 0], [0.323, 1]]);
const ringRotZ = track([[0.191, -2.324], [0.349, -0.897]]);
const handX = track([[0.744, -3.285], [0.931, -4.025, EASE]]);
const handY = track([[0.744, -3.427], [0.931, -1.791, EASE]]);
const handZ = track([[0.744, 0.29], [0.931, 0.334, EASE]]);

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, offset: { value: 0.5 }, darkness: { value: 0.71 }, contrast: { value: 0.1 }, saturation: { value: 0.4 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float offset; uniform float darkness; uniform float contrast; uniform float saturation;
    varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      c.rgb = (c.rgb - 0.5) * (1.0 + contrast) + 0.5;
      float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
      c.rgb = mix(vec3(l), c.rgb, 1.0 + saturation);
      vec2 uv = (vUv - 0.5) * vec2(offset);
      c.rgb = mix(c.rgb, vec3(0.0), clamp(dot(uv, uv) * darkness * 2.5, 0.0, 1.0));
      gl_FragColor = c;
    }`,
};

export interface DropScene {
  setProgress(p: number): void;
  start(): void;
  stop(): void;
  resize(): void;
  dispose(): void;
}

const ASSETS = '/drop/';

export async function createDropScene(canvas: HTMLCanvasElement, tier: MotionTier, onProgress?: (p: number) => void): Promise<DropScene> {
  const dpr = Math.min(window.devicePixelRatio || 1, tier === 'full' ? 1.75 : 1.2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);

  // ---- Loaders
  const draco = new DRACOLoader();
  draco.setDecoderPath('/draco/');
  const gltf = new GLTFLoader();
  gltf.setDRACOLoader(draco);
  const exr = new EXRLoader();
  let loaded = 0;
  const total = 6;
  const step = () => onProgress?.(++loaded / total);

  const [rockG, handG, ringG, sphereG, envTex] = await Promise.all([
    gltf.loadAsync(ASSETS + 'rock.glb').then((g) => (step(), g)),
    gltf.loadAsync(ASSETS + 'hand.glb').then((g) => (step(), g)),
    gltf.loadAsync(ASSETS + 'ring2.glb').then((g) => (step(), g)),
    gltf.loadAsync(ASSETS + 'sphere.glb').then((g) => (step(), g)),
    exr.loadAsync(ASSETS + 'studio.exr').then((t) => (step(), t)),
  ]);

  // ---- Environment (studio EXR, intensity .7, rotated 2.848)
  const pmrem = new THREE.PMREMGenerator(renderer);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  const envRT = pmrem.fromEquirectangular(envTex);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.45;
  scene.environmentRotation.set(0, 2.848, 0);
  envTex.dispose();
  pmrem.dispose();

  scene.add(new THREE.AmbientLight(0xffffff, 0.12));

  // ---- Rocks: four placements from the scene state (same model, textured)
  const rockRoot = rockG.scene;
  rockRoot.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.color.set(0x545454);
      mat.roughness = 1;
      mat.metalness = 0.1;
      mat.side = THREE.DoubleSide;
    }
  });
  const placeRock = (p: [number, number, number], r: [number, number, number], s: [number, number, number]) => {
    const c = rockRoot.clone(true);
    c.position.set(...p);
    c.rotation.set(...r);
    c.scale.set(...s);
    scene.add(c);
    return c;
  };
  placeRock([0, 0, 0], [0, 0, 0], [0.01, 0.02, 0.01]);
  placeRock([-7.1227, 0, 0], [0, 0, 0], [0.01, 0.02, 0.01]);
  placeRock([0.337, -3.932, 0.703], [3.1126, 0.7898, -4.6716], [0.01, 0.01, 0.01]);
  const pebble = placeRock([-2.4173, 9.3849, 2.2305], [0, 0, 0], [0.001, 0.001, 0.001]);

  // ---- Rings: glowing ring2 and dark ring3 (same mesh)
  const ringMesh = ringG.scene.getObjectByProperty('isMesh', true) as THREE.Mesh;
  const ring2 = ringMesh.clone();
  ring2.material = new THREE.MeshStandardMaterial({ color: 0xe7e7e7, emissive: new THREE.Color(0x3300ff), emissiveIntensity: 1, roughness: 0.5, metalness: 0, side: THREE.DoubleSide });
  ring2.position.set(-3.2238, 6.3741, 0.0913);
  scene.add(ring2);
  const ring3 = ringMesh.clone();
  ring3.material = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.755, metalness: 0, side: THREE.DoubleSide });
  ring3.scale.setScalar(0.97);
  scene.add(ring3);

  // ---- Hand (black metal), rises at the end
  const hand = handG.scene;
  hand.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) m.material = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.6275, roughness: 0.4431, side: THREE.DoubleSide });
  });
  hand.scale.setScalar(0.5);
  hand.rotation.set(7.4391, -0.1829, -0.4287);
  scene.add(hand);

  // ---- Sphere with looping gradient video as emissive map, plus its baked animation
  const video = document.createElement('video');
  video.src = ASSETS + 'sphere-emissive.mp4';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';
  video.preload = 'auto';
  const videoTex = new THREE.VideoTexture(video);
  videoTex.colorSpace = THREE.SRGBColorSpace;
  videoTex.wrapS = videoTex.wrapT = THREE.ClampToEdgeWrapping;
  const tryPlay = () => video.play().catch(() => undefined);
  video.addEventListener('canplay', () => (step(), tryPlay()), { once: true });
  video.load();
  window.addEventListener('pointerdown', tryPlay, { once: true });

  const sphereRoot = sphereG.scene;
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    metalness: 1,
    roughness: 0.4,
    emissive: new THREE.Color(0x000000),
    emissiveMap: videoTex,
    emissiveIntensity: 1,
  });
  sphereRoot.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.material = sphereMat;
      m.receiveShadow = true;
    }
  });
  scene.add(sphereRoot);
  const mixer = new THREE.AnimationMixer(sphereRoot);
  sphereG.animations.forEach((clip) => mixer.clipAction(clip).play());
  // Point light parented to the sphere (intensity 25, decay 3.34)
  const key = new THREE.PointLight(0xffffff, 9, 100, 3.34);
  sphereRoot.add(key);
  // Extra sweep light so the dark sphere and walls glint while idle
  const sweep = new THREE.PointLight(0xffffff, 3.5, 14, 2);
  scene.add(sweep);

  // ---- Water: flow-map water 10 x 13.5 at (-2.92,-1.94,-1.87)
  const texLoader = new THREE.TextureLoader();
  const [n0, n1] = await Promise.all([texLoader.loadAsync(ASSETS + 'water1.jpg'), texLoader.loadAsync(ASSETS + 'water2.jpg')]);
  n0.wrapS = n0.wrapT = n1.wrapS = n1.wrapT = THREE.RepeatWrapping;
  const water = new Water(new THREE.PlaneGeometry(10, 13.532), {
    color: 0xffffff,
    scale: 1,
    flowDirection: new THREE.Vector2(1, 1),
    flowSpeed: 0.05,
    reflectivity: 1,
    textureWidth: tier === 'full' ? 1024 : 512,
    textureHeight: tier === 'full' ? 1024 : 512,
    normalMap0: n0,
    normalMap1: n1,
  });
  water.rotation.x = -Math.PI / 2;
  water.position.set(-2.9216, -1.9417, -1.8666);
  scene.add(water);

  // ---- Post: bloom, vignette .5/.71, contrast .1, saturation .4
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(512, 512), 0.32, 0.6, 0.92));
  composer.addPass(new ShaderPass(GradeShader));
  composer.addPass(new OutputPass());

  // ---- Pointer parallax + state
  const pointer = new THREE.Vector2();
  const pointerTarget = new THREE.Vector2();
  const onMove = (e: PointerEvent) => pointerTarget.set((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2);
  if (tier === 'full') window.addEventListener('pointermove', onMove, { passive: true });

  let progress = 0;
  let smooth = 0;
  let running = false;
  let raf = 0;
  let last = performance.now();
  let t = 0;

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  const frame = () => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;
    mixer.update(dt);
    smooth += (progress - smooth) * 0.12;
    const p = smooth;

    pointer.lerp(pointerTarget, 0.05);
    const driftX = Math.sin(t * 0.31) * 0.2 + pointer.x * 0.4;
    const driftY = Math.sin(t * 0.47 + 1.3) * 0.12 - pointer.y * 0.22;
    camera.position.set(camX(p) + driftX, camY(p) + driftY, camZ(p) + Math.sin(t * 0.22) * 0.15);
    camera.lookAt(camX(p) + driftX * 0.4, camY(p) + driftY * 0.4, 0);

    sphereRoot.position.set(sphX(p), sphY(p) + Math.sin(t * 1.1) * 0.06, 0);
    sphereRoot.scale.setScalar(sphS(p));
    const glow = sphGlow(p);
    sphereMat.emissive.setScalar(0.04 + glow * 0.96);
    key.intensity = 9 + glow * 10;
    sweep.position.set(sphereRoot.position.x + Math.cos(t * 0.9) * 2.4, sphereRoot.position.y + 1.2 + Math.sin(t * 0.7) * 0.8, Math.sin(t * 0.9) * 2.4);

    ring2.rotation.set(0.2038, t * 0.4, ringRotZ(p));
    ring3.rotation.y = t * 0.1;
    pebble.position.y = 9.3849 + Math.sin(t * 0.8) * 0.12;
    pebble.rotation.y = t * 0.4;

    hand.position.set(handX(p), handY(p), handZ(p));

    if (video.paused && video.readyState >= 2) tryPlay();
    composer.render();
  };

  return {
    setProgress(p) {
      progress = Math.min(1, Math.max(0, p));
    },
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
      tryPlay();
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      video.pause();
    },
    resize,
    dispose() {
      this.stop();
      window.removeEventListener('pointermove', onMove);
      composer.dispose();
      envRT.dispose();
      videoTex.dispose();
      video.src = '';
      draco.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
      renderer.dispose();
    },
  };
}

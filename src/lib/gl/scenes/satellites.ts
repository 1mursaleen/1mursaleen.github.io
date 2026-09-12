import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { SceneFactory, SceneModule } from '../manager';
import { palette } from '../manager';
import { latLngToVector3, fibonacciSphere } from '../geo';
import { places } from '../../../data/places';

/**
 * Eutelsat: a modeled spacecraft (bus, solar wings, dish) in an inclined orbit
 * around a dotted Earth, holding a signal beam on the Paris ground station while
 * in view; behind it the OneWeb-style LEO shell and the GEO ring.
 */

function gridTexture(cells: number, base: string, line: string) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 96;
  const g = c.getContext('2d')!;
  g.fillStyle = base;
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = line;
  g.lineWidth = 2;
  for (let i = 0; i <= cells; i++) {
    const x = (i / cells) * c.width;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, c.height);
    g.stroke();
  }
  for (let j = 0; j <= 3; j++) {
    const y = (j / 3) * c.height;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(c.width, y);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function buildSatellite(scale = 1) {
  const sat = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9a92e, metalness: 0.85, roughness: 0.32 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf2f2ee, metalness: 0.1, roughness: 0.55 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, metalness: 0.4, roughness: 0.6 });
  const panelMat = new THREE.MeshStandardMaterial({ map: gridTexture(8, '#13214a', '#6f8fe8'), metalness: 0.55, roughness: 0.3 });

  // Bus
  const bus = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.3), gold);
  sat.add(bus);
  // Radiator plates
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.19, 0.02), white);
  plate.position.z = -0.16;
  sat.add(plate);
  // Solar wings on a yoke
  for (const side of [-1, 1]) {
    const yoke = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), dark);
    yoke.rotation.z = Math.PI / 2;
    yoke.position.x = side * 0.17;
    sat.add(yoke);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.012, 0.26), panelMat);
    wing.position.x = side * (0.25 + 0.39);
    sat.add(wing);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 0.02), dark);
    frame.position.set(side * (0.25 + 0.39), 0, 0.14);
    sat.add(frame);
    const frame2 = frame.clone();
    frame2.position.z = -0.14;
    sat.add(frame2);
  }
  // Dish (parabola) facing +z toward Earth
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 12; i++) {
    const r = (i / 12) * 0.16;
    pts.push(new THREE.Vector2(r, r * r * 3.2));
  }
  const dish = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), new THREE.MeshStandardMaterial({ color: 0xf2f2ee, metalness: 0.2, roughness: 0.4, side: THREE.DoubleSide }));
  dish.rotation.x = -Math.PI / 2;
  dish.position.z = 0.2;
  sat.add(dish);
  const feed = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 6), dark);
  feed.rotation.x = Math.PI / 2;
  feed.position.z = 0.26;
  sat.add(feed);
  const feedTip = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), gold);
  feedTip.position.z = 0.32;
  sat.add(feedTip);
  // Antenna mast
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.22, 6), dark);
  mast.position.y = 0.2;
  sat.add(mast);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), new THREE.MeshStandardMaterial({ color: palette.hot, emissive: palette.hot, emissiveIntensity: 0.8 }));
  tip.position.y = 0.31;
  sat.add(tip);

  sat.scale.setScalar(scale);
  return sat;
}

export const createSatellites: SceneFactory = async (host, props, { tier, shared, renderer }) => {
  void host;
  void props;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

  // Lighting + reflections for the metal spacecraft
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(5, 3, 4);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  scene.add(new THREE.HemisphereLight(0xffffff, 0x223322, 0.35));
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.5;
  pmrem.dispose();

  const root = new THREE.Group();
  scene.add(root);

  // ---- Earth: dark sphere with light land dots and a thin atmosphere
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), new THREE.MeshStandardMaterial({ color: palette.earth, roughness: 0.9, metalness: 0 }));
  root.add(earth);
  const samples = fibonacciSphere(tier === 'full' ? 12000 : 6000);
  const land = shared.landTest ? samples.filter((v) => shared.landTest!(v)) : samples.filter((_, i) => i % 3 === 0);
  const landPts = new THREE.Points(
    new THREE.BufferGeometry().setFromPoints(land.map((v) => v.multiplyScalar(1.003))),
    new THREE.PointsMaterial({ color: palette.bg, size: 0.011, sizeAttenuation: true, transparent: true, opacity: 0.85 }),
  );
  root.add(landPts);
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.04, 48, 32),
    new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.12, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  root.add(atmo);

  // ---- Constellations
  const leoCount = tier === 'full' ? 420 : 200;
  const planes = 12;
  const perPlane = Math.ceil(leoCount / planes);
  const leoR = 1.19;
  const leoPos = new Float32Array(leoCount * 3);
  const leoPhase = new Float32Array(leoCount);
  const leoPlane = new Uint8Array(leoCount);
  for (let i = 0; i < leoCount; i++) {
    leoPlane[i] = i % planes;
    leoPhase[i] = (Math.floor(i / planes) / perPlane) * Math.PI * 2 + (i % 2) * (Math.PI / perPlane);
  }
  const leoGeo = new THREE.BufferGeometry();
  leoGeo.setAttribute('position', new THREE.BufferAttribute(leoPos, 3));
  root.add(new THREE.Points(leoGeo, new THREE.PointsMaterial({ color: palette.hot, size: 0.02, sizeAttenuation: true })));
  const planeQuats = Array.from({ length: planes }, (_, p) => new THREE.Quaternion().setFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(87.9), (p / planes) * Math.PI, 0, 'YXZ')));

  const geoR = 2.7;
  const geoCount = tier === 'full' ? 200 : 100;
  const geoPos = new Float32Array(geoCount * 3);
  for (let i = 0; i < geoCount; i++) {
    const a = (i / geoCount) * Math.PI * 2;
    geoPos[i * 3] = Math.cos(a) * geoR;
    geoPos[i * 3 + 2] = Math.sin(a) * geoR;
  }
  const geoGeo = new THREE.BufferGeometry();
  geoGeo.setAttribute('position', new THREE.BufferAttribute(geoPos, 3));
  root.add(new THREE.Points(geoGeo, new THREE.PointsMaterial({ color: palette.accent, size: 0.028, sizeAttenuation: true })));
  root.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: 161 }, (_, i) => new THREE.Vector3(Math.cos((i / 160) * Math.PI * 2) * geoR, 0, Math.sin((i / 160) * Math.PI * 2) * geoR))),
      new THREE.LineBasicMaterial({ color: palette.accent, transparent: true, opacity: 0.3 }),
    ),
  );

  // ---- Hero spacecraft in an inclined orbit, plus two small companions
  const hero = buildSatellite(1);
  scene.add(hero);
  const heroOrbit = { r: 1.75, inc: 0.62, node: 0.4, speed: 0.22 };
  const companions = [buildSatellite(0.35), buildSatellite(0.35)];
  companions.forEach((c) => scene.add(c));
  const compOrbits = [
    { r: 1.35, inc: 1.2, node: 1.9, speed: 0.34, phase: 1.2 },
    { r: 2.1, inc: 0.3, node: 3.4, speed: 0.17, phase: 4.0 },
  ];
  const orbitPos = (o: { r: number; inc: number; node: number }, a: number, out: THREE.Vector3) => {
    out.set(Math.cos(a) * o.r, 0, Math.sin(a) * o.r);
    out.applyAxisAngle(new THREE.Vector3(1, 0, 0), o.inc);
    out.applyAxisAngle(new THREE.Vector3(0, 1, 0), o.node);
    return out;
  };
  // Orbit trace for the hero
  const tracePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 200; i++) tracePts.push(orbitPos(heroOrbit, (i / 200) * Math.PI * 2, new THREE.Vector3()));
  const trace = new THREE.Line(new THREE.BufferGeometry().setFromPoints(tracePts), new THREE.LineDashedMaterial({ color: palette.muted, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0.6 }));
  trace.computeLineDistances();
  scene.add(trace);

  // ---- Paris ground station + signal beam (cone from dish to station)
  const paris = latLngToVector3(places.paris.lat, places.paris.lng, 1.005);
  const station = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), new THREE.MeshStandardMaterial({ color: palette.hot, emissive: palette.hot, emissiveIntensity: 0.6 }));
  station.position.copy(paris);
  root.add(station);
  const stationRing = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.062, 32), new THREE.MeshBasicMaterial({ color: palette.hot, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }));
  stationRing.position.copy(paris);
  stationRing.lookAt(paris.clone().multiplyScalar(2));
  root.add(stationRing);
  const beamMat = new THREE.MeshBasicMaterial({ color: palette.hot, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.09, 1, 24, 1, true), beamMat);
  scene.add(beam);
  const beamLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: palette.hot, transparent: true, opacity: 0.9 }));
  scene.add(beamLine);

  let progress = 0;
  const heroPos = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const stationWorld = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  const mod: SceneModule = {
    scene,
    camera,
    setProgress(p) {
      progress = p;
    },
    update(dt, t) {
      root.rotation.y += dt * 0.04;

      // LEO shell
      for (let i = 0; i < leoCount; i++) {
        const a = leoPhase[i] + t * 0.3;
        tmp.set(Math.cos(a) * leoR, 0, Math.sin(a) * leoR).applyQuaternion(planeQuats[leoPlane[i]]);
        leoPos[i * 3] = tmp.x;
        leoPos[i * 3 + 1] = tmp.y;
        leoPos[i * 3 + 2] = tmp.z;
      }
      leoGeo.attributes.position.needsUpdate = true;

      // Hero spacecraft: orbit, keep dish on Earth, roll wings toward the sun
      orbitPos(heroOrbit, t * heroOrbit.speed, heroPos);
      hero.position.copy(heroPos);
      hero.lookAt(0, 0, 0);
      hero.rotateY(Math.PI); // dish (+z) toward Earth
      hero.rotateZ(Math.sin(t * 0.15) * 0.4 + 0.8);
      companions.forEach((c, i) => {
        const o = compOrbits[i];
        orbitPos(o, t * o.speed + o.phase, tmp);
        c.position.copy(tmp);
        c.lookAt(0, 0, 0);
        c.rotateY(Math.PI);
      });

      // Beam to Paris when the station faces the spacecraft
      station.getWorldPosition(stationWorld);
      const visible = stationWorld.clone().normalize().dot(heroPos.clone().normalize()) > 0.45;
      beam.visible = visible;
      beamLine.visible = visible;
      if (visible) {
        const dishWorld = hero.localToWorld(new THREE.Vector3(0, 0, 0.3));
        const mid = dishWorld.clone().add(stationWorld).multiplyScalar(0.5);
        const len = dishWorld.distanceTo(stationWorld);
        beam.position.copy(mid);
        beam.scale.set(1, len, 1);
        beam.quaternion.setFromUnitVectors(up, stationWorld.clone().sub(dishWorld).normalize());
        beamMat.opacity = 0.16 + Math.sin(t * 6) * 0.05;
        const arr = beamLine.geometry.attributes.position.array as Float32Array;
        arr[0] = dishWorld.x; arr[1] = dishWorld.y; arr[2] = dishWorld.z;
        arr[3] = stationWorld.x; arr[4] = stationWorld.y; arr[5] = stationWorld.z;
        beamLine.geometry.attributes.position.needsUpdate = true;
      }
      stationRing.scale.setScalar(1 + Math.sin(t * 2.5) * 0.25);

      // Camera: slow orbit, steered by scroll, looking between Earth and the spacecraft
      const ang = 0.9 + progress * 1.2 + t * 0.03;
      const camR = 5.4 - progress * 0.5;
      camera.position.set(Math.cos(ang) * camR, 1.5 + progress * 0.5, Math.sin(ang) * camR);
      lookTarget.copy(heroPos).multiplyScalar(0.45);
      camera.lookAt(lookTarget);
    },
    dispose() {
      envRT.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
    },
  };
  return mod;
};

import * as THREE from 'three';
import type { SceneFactory, SceneModule } from '../manager';
import { palette } from '../manager';
import { latLngToVector3, greatCircleArc, fibonacciSphere } from '../geo';
import { places, trajectory, remoteFanOut } from '../../../data/places';
import type { PlaceId } from '../../../data/types';

const R = 1;

export const createGlobe: SceneFactory = async (host, props, { tier, shared }) => {
  const mode = (props.mode as string) ?? 'hero';
  const focusPlace = (props.place as PlaceId | undefined) ?? 'islamabad';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.25, 3.6);
  camera.lookAt(0, 0, 0);

  const globe = new THREE.Group();
  scene.add(globe);

  // Land dots
  const count = tier === 'full' ? 22000 : 9000;
  const samples = fibonacciSphere(count);
  const land = shared.landTest ? samples.filter((v) => shared.landTest!(v)) : samples.filter((_, i) => i % 3 === 0);
  const landGeo = new THREE.BufferGeometry().setFromPoints(land.map((v) => v.multiplyScalar(R)));
  const landMat = new THREE.PointsMaterial({ color: palette.fg, size: 0.014, sizeAttenuation: true, transparent: true, opacity: 0.9 });
  const landPts = new THREE.Points(landGeo, landMat);
  globe.add(landPts);

  // Graticule sphere (very faint)
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(R * 0.995, 24, 16)),
    new THREE.LineBasicMaterial({ color: palette.line, transparent: true, opacity: 0.35 }),
  );
  globe.add(wire);

  // Occluder so back-side dots are hidden
  const occluder = new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 48, 32), new THREE.MeshBasicMaterial({ color: palette.bg }));
  globe.add(occluder);

  // Trajectory arcs
  const arcMat = new THREE.LineBasicMaterial({ color: palette.accent, transparent: true, opacity: 0.95 });
  const arcs: THREE.Line[] = [];
  for (let i = 0; i < trajectory.length - 1; i++) {
    const a = places[trajectory[i]], b = places[trajectory[i + 1]];
    const pts = greatCircleArc(latLngToVector3(a.lat, a.lng, R), latLngToVector3(b.lat, b.lng, R), 72, 0.18);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, arcMat);
    globe.add(line);
    arcs.push(line);
  }
  // Remote fan-out (dashed, dim)
  const dashMat = new THREE.LineDashedMaterial({ color: palette.muted, dashSize: 0.04, gapSize: 0.03, transparent: true, opacity: 0.55 });
  const base = places['islamabad'];
  for (const id of remoteFanOut) {
    const b = places[id];
    const pts = greatCircleArc(latLngToVector3(base.lat, base.lng, R), latLngToVector3(b.lat, b.lng, R), 80, 0.3);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), dashMat);
    line.computeLineDistances();
    globe.add(line);
  }

  // City markers
  const markerGeo = new THREE.SphereGeometry(0.018, 12, 12);
  const markerMat = new THREE.MeshBasicMaterial({ color: palette.fg });
  const ringGeo = new THREE.RingGeometry(0.03, 0.036, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: palette.hot, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
  const markers = new Map<PlaceId, THREE.Group>();
  for (const id of [...trajectory, ...remoteFanOut] as PlaceId[]) {
    const p = places[id];
    const pos = latLngToVector3(p.lat, p.lng, R * 1.002);
    const g = new THREE.Group();
    const m = new THREE.Mesh(markerGeo, trajectory.includes(id) ? markerMat : new THREE.MeshBasicMaterial({ color: palette.muted }));
    g.add(m);
    if (trajectory.includes(id)) {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.lookAt(pos.clone().multiplyScalar(2));
      g.add(ring);
    }
    g.position.copy(pos);
    globe.add(g);
    markers.set(id, g);
  }

  // LEO orbit ring (~1200 km ≈ 1.19 R) and a satellite dot travelling on it
  const orbitR = R * 1.19;
  const orbitPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    orbitPts.push(new THREE.Vector3(Math.cos(a) * orbitR, 0, Math.sin(a) * orbitR));
  }
  const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPts), new THREE.LineBasicMaterial({ color: palette.accent, transparent: true, opacity: 0.45 }));
  orbit.rotation.set(THREE.MathUtils.degToRad(87.9), 0.4, 0);
  scene.add(orbit);
  const sat = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), new THREE.MeshBasicMaterial({ color: palette.hot }));
  orbit.add(sat);

  // Pointer parallax (hero, full tier only)
  const target = new THREE.Vector2();
  const onMove = (e: PointerEvent) => {
    target.set((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2);
  };
  if (mode === 'hero' && tier === 'full') window.addEventListener('pointermove', onMove, { passive: true });

  // Orientation control: rotate globe so `focus` faces the camera.
  const desired = new THREE.Quaternion();
  const front = new THREE.Vector3(0, 0, 1);
  const focusOn = (id: PlaceId) => {
    const p = places[id];
    const v = latLngToVector3(p.lat, p.lng, 1).normalize();
    desired.setFromUnitVectors(v, front);
  };
  let autoRotate = mode === 'hero';
  if (mode !== 'hero') focusOn(focusPlace);
  else focusOn('dubai');

  const onJourney = (e: Event) => {
    const id = (e as CustomEvent<{ place: PlaceId }>).detail.place;
    if (places[id]) focusOn(id);
  };
  if (mode === 'journey') window.addEventListener('journey:place', onJourney);

  const tmpQ = new THREE.Quaternion();
  let spin = 0;

  const mod: SceneModule = {
    scene,
    camera,
    update(dt, t) {
      // Ease toward desired orientation, then add a gentle spin around Y.
      spin += dt * (autoRotate ? 0.08 : 0.03);
      tmpQ.copy(desired);
      const spinQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), mode === 'hero' ? spin : Math.sin(t * 0.25) * 0.15);
      tmpQ.premultiply(spinQ);
      globe.quaternion.slerp(tmpQ, 1 - Math.pow(0.001, dt));
      orbit.rotation.y += dt * 0.25;
      const a = t * 0.9;
      sat.position.set(Math.cos(a) * orbitR, 0, Math.sin(a) * orbitR);
      // Pulse rings
      markers.forEach((g) => {
        const ring = g.children[1];
        if (ring) {
          const s = 1 + Math.sin(t * 2.2) * 0.25;
          ring.scale.setScalar(s);
        }
      });
      camera.position.x += (target.x * 0.25 - camera.position.x) * 0.04;
      camera.position.y += (0.25 - target.y * 0.15 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
    },
    dispose() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('journey:place', onJourney);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
    },
  };
  void host;
  return mod;
};

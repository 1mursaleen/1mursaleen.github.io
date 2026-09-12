import * as THREE from 'three';
import type { SceneFactory, SceneModule } from '../manager';
import { palette } from '../manager';

/** A sparse drifting particle field behind the agent-ready block. */
export const createField: SceneFactory = async (host, props, { tier }) => {
  void host;
  void props;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 6;

  const count = tier === 'full' ? 700 : 250;
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    vel[i] = 0.05 + Math.random() * 0.15;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: new THREE.Color('#c6d4cc'), size: 0.035, transparent: true, opacity: 0.7 }));
  scene.add(pts);

  // A few accent nodes with connecting lines, hinting at an agent graph
  const nodes = tier === 'full' ? 9 : 5;
  const nodePos = new Float32Array(nodes * 3);
  for (let i = 0; i < nodes; i++) {
    nodePos[i * 3] = (Math.random() - 0.5) * 12;
    nodePos[i * 3 + 1] = (Math.random() - 0.5) * 6;
    nodePos[i * 3 + 2] = (Math.random() - 0.5) * 2;
  }
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));
  scene.add(new THREE.Points(nodeGeo, new THREE.PointsMaterial({ color: palette.hot, size: 0.09 })));
  const linePos = new Float32Array((nodes - 1) * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  scene.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: palette.hot, transparent: true, opacity: 0.35 })));

  const mod: SceneModule = {
    scene,
    camera,
    update(dt, t) {
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += vel[i] * dt;
        if (pos[i * 3 + 1] > 4) pos[i * 3 + 1] = -4;
      }
      geo.attributes.position.needsUpdate = true;
      for (let i = 0; i < nodes; i++) {
        nodePos[i * 3 + 1] += Math.sin(t * 0.4 + i) * dt * 0.15;
      }
      nodeGeo.attributes.position.needsUpdate = true;
      for (let i = 0; i < nodes - 1; i++) {
        linePos[i * 6] = nodePos[i * 3]; linePos[i * 6 + 1] = nodePos[i * 3 + 1]; linePos[i * 6 + 2] = nodePos[i * 3 + 2];
        linePos[i * 6 + 3] = nodePos[(i + 1) * 3]; linePos[i * 6 + 4] = nodePos[(i + 1) * 3 + 1]; linePos[i * 6 + 5] = nodePos[(i + 1) * 3 + 2];
      }
      lineGeo.attributes.position.needsUpdate = true;
      pts.rotation.y = Math.sin(t * 0.05) * 0.1;
    },
    dispose() {
      geo.dispose();
      nodeGeo.dispose();
      lineGeo.dispose();
      scene.traverse((o) => ((o as THREE.Points).material as THREE.Material | undefined)?.dispose?.());
    },
  };
  return mod;
};

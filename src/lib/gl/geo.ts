import * as THREE from 'three';

/** lat/lng in degrees to a unit-sphere vector (Y up, lng 0 facing +Z). */
export function latLngToVector3(lat: number, lng: number, radius = 1): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lng + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Points along a great-circle arc lifted above the surface. */
export function greatCircleArc(a: THREE.Vector3, b: THREE.Vector3, segments = 64, lift = 0.22): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const an = a.clone().normalize();
  const bn = b.clone().normalize();
  const angle = an.angleTo(bn);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = slerp(an, bn, angle, t);
    const h = 1 + Math.sin(Math.PI * t) * lift * Math.min(1, angle / 1.2);
    pts.push(p.multiplyScalar(h));
  }
  return pts;
}

function slerp(a: THREE.Vector3, b: THREE.Vector3, angle: number, t: number) {
  if (angle < 1e-6) return a.clone();
  const s = Math.sin(angle);
  const wa = Math.sin((1 - t) * angle) / s;
  const wb = Math.sin(t * angle) / s;
  return a.clone().multiplyScalar(wa).add(b.clone().multiplyScalar(wb));
}

/** Fibonacci sphere sampling. */
export function fibonacciSphere(n: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
  }
  return pts;
}

/** Load an equirectangular earth image and return a land test. */
export async function loadLandMask(url: string): Promise<(v: THREE.Vector3) => boolean> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = url;
  });
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
  return (v: THREE.Vector3) => {
    const n = v.clone().normalize();
    const lat = 90 - THREE.MathUtils.radToDeg(Math.acos(n.y));
    const lng = THREE.MathUtils.radToDeg(Math.atan2(n.z, -n.x)) - 180;
    const u = ((lng + 180) / 360 + 1) % 1;
    const vv = (90 - lat) / 180;
    const x = Math.min(width - 1, Math.floor(u * width));
    const y = Math.min(height - 1, Math.floor(vv * height));
    const i = (y * width + x) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // Ocean is blue-dominant; clouds/ice are neutral. Land has warm or green cast.
    return r - b > 14 || g - b > 14;
  };
}

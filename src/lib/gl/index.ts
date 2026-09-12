import { motionTier, hasWebGL } from '../motion/prefs';
import type { GLManager } from './manager';

let manager: GLManager | null = null;

/**
 * Finds [data-gl] hosts and lazily boots the shared renderer plus each scene.
 * Three.js is only downloaded when a host exists and the tier allows WebGL.
 */
export function mountScenes() {
  const hosts = Array.from(document.querySelectorAll<HTMLElement>('[data-gl]'));
  if (!hosts.length) return;
  const tier = motionTier();
  if (tier === 'static' || !hasWebGL()) return;
  const canvas = document.getElementById('gl') as HTMLCanvasElement | null;
  if (!canvas) return;

  const start = async () => {
    const [{ GLManager }, { loadLandMask }] = await Promise.all([import('./manager'), import('./geo')]);
    manager = new GLManager(canvas, tier);
    try {
      manager.shared.landTest = await loadLandMask('/textures/land-512.jpg');
    } catch {
      /* fall back to uniform dots */
    }
    const wanted = tier === 'lite' ? hosts.filter((h) => h.dataset.gl !== 'field') : hosts;
    for (const host of wanted) {
      const name = host.dataset.gl!;
      let props: Record<string, unknown> = {};
      try {
        props = JSON.parse(host.dataset.glProps ?? '{}');
      } catch {
        /* ignore */
      }
      const factory =
        name === 'globe'
          ? (await import('./scenes/globe')).createGlobe
          : name === 'satellites'
            ? (await import('./scenes/satellites')).createSatellites
            : name === 'field'
              ? (await import('./scenes/field')).createField
              : null;
      if (!factory) continue;
      const mod = await factory(host, props, { tier, shared: manager.shared, renderer: manager.renderer });
      manager.add(host, mod);
      if (mod.setProgress) attachProgress(host, mod.setProgress);
    }
  };

  // Defer until idle so hero text paints first.
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (idle) idle(() => void start(), { timeout: 1200 });
  else setTimeout(() => void start(), 300);
}

/** Map a host's traversal through the viewport to 0..1 without GSAP dependency. */
function attachProgress(host: HTMLElement, set: (p: number) => void) {
  const update = () => {
    const r = host.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    set(p);
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

export function disposeScenes() {
  manager?.disposeAll();
  manager = null;
}

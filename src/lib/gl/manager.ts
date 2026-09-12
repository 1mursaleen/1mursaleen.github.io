import * as THREE from 'three';
import type { MotionTier } from '../motion/prefs';

export interface SceneModule {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  update(dt: number, t: number): void;
  setProgress?(p: number): void;
  resize?(w: number, h: number): void;
  dispose(): void;
}

export type SceneFactory = (host: HTMLElement, props: Record<string, unknown>, ctx: { tier: MotionTier; shared: SharedAssets; renderer: THREE.WebGLRenderer }) => Promise<SceneModule>;

export interface SharedAssets {
  landTest?: (v: THREE.Vector3) => boolean;
}

interface Slot {
  host: HTMLElement;
  mod: SceneModule;
  active: boolean;
  rect: DOMRect;
}

/** Filled from CSS custom properties at manager construction so scenes follow the theme. */
export const palette = {
  accent: new THREE.Color('#083d2a'), // arcs, primary lines (--gl-arc)
  hot: new THREE.Color('#f6e016'), // highlights (--gl-hot)
  fg: new THREE.Color('#022016'), // land dots (--gl-dot)
  muted: new THREE.Color('#6f857b'),
  dim: new THREE.Color('#9db1a6'),
  line: new THREE.Color('#b4b4aa'),
  bg: new THREE.Color('#f7f7f7'),
  earth: new THREE.Color('#022016'),
};

function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  const read = (name: string, into: THREE.Color) => {
    const v = cs.getPropertyValue(name).trim();
    if (v) {
      try {
        into.set(v);
      } catch {
        /* keep default */
      }
    }
  };
  read('--gl-arc', palette.accent);
  read('--gl-hot', palette.hot);
  read('--gl-dot', palette.fg);
  read('--gl-muted', palette.muted);
  read('--gl-line', palette.line);
  read('--gl-bg', palette.bg);
  read('--gl-earth', palette.earth);
}

export class GLManager {
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  slots: Slot[] = [];
  shared: SharedAssets = {};
  private raf = 0;
  private last = 0;
  private elapsed = 0;
  private io: IntersectionObserver;
  private running = false;
  tier: MotionTier;

  constructor(canvas: HTMLCanvasElement, tier: MotionTier) {
    this.canvas = canvas;
    this.tier = tier;
    readPalette();
    const dpr = Math.min(window.devicePixelRatio || 1, tier === 'full' ? 2 : 1.25);
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: dpr < 1.5, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(dpr);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.autoClear = false;
    this.renderer.setScissorTest(true);
    this.resize();
    window.addEventListener('resize', this.resize, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
    this.io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const slot = this.slots.find((s) => s.host === e.target);
          if (slot) slot.active = e.isIntersecting;
        }
        this.syncLoop();
      },
      { rootMargin: '25% 0px 25% 0px' },
    );
  }

  add(host: HTMLElement, mod: SceneModule) {
    const slot: Slot = { host, mod, active: false, rect: host.getBoundingClientRect() };
    this.slots.push(slot);
    this.io.observe(host);
    host.classList.add('is-live');
    this.canvas.classList.add('is-ready');
    this.syncLoop();
  }

  resize = () => {
    const W = this.canvas.clientWidth || window.innerWidth;
    const H = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.tier === 'full' ? 2 : 1.25));
    this.renderer.setSize(W, H, false);
    for (const s of this.slots) {
      s.rect = s.host.getBoundingClientRect();
      s.mod.resize?.(s.rect.width, s.rect.height);
    }
  };

  private onVisibility = () => this.syncLoop();

  private syncLoop() {
    const anyActive = this.slots.some((s) => s.active) && !document.hidden;
    if (anyActive && !this.running) {
      this.running = true;
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    } else if (!anyActive && this.running) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }
  }

  private frame = () => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.elapsed += dt;
    const t = this.elapsed;
    const W = this.canvas.clientWidth;
    const H = this.canvas.clientHeight;
    const pr = this.renderer.getPixelRatio();
    if (Math.abs(this.canvas.width - W * pr) > 1 || Math.abs(this.canvas.height - H * pr) > 1) this.resize();
    this.renderer.setScissor(0, 0, W, H);
    this.renderer.setViewport(0, 0, W, H);
    this.renderer.clear();
    for (const s of this.slots) {
      if (!s.active) continue;
      const r = s.host.getBoundingClientRect();
      s.rect = r;
      if (r.bottom < 0 || r.top > H || r.width === 0 || r.height === 0) continue;
      // Scissor in bottom-left origin coordinates.
      const x = r.left;
      const y = H - r.bottom;
      const w = r.width;
      const h = r.height;
      s.mod.camera.aspect = w / h;
      s.mod.camera.updateProjectionMatrix();
      s.mod.update(dt, t);
      this.renderer.setScissor(x, y, w, h);
      this.renderer.setViewport(x, y, w, h);
      this.renderer.render(s.mod.scene, s.mod.camera);
    }
  };

  disposeAll() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.io.disconnect();
    for (const s of this.slots) s.mod.dispose();
    this.slots = [];
    this.renderer.dispose();
  }
}

/**
 * Scroll-scrubbed image sequence (the orgnzm.studio hero rock, used with permission).
 * Frames live at /org/rock/NNN.webp for even NNN in [0, 360]. They load in a
 * coarse-to-fine order so the first scrub already shows the right shape.
 */
export function initRockSequence() {
  const section = document.querySelector<HTMLElement>('[data-rock-sequence]');
  if (!section) return;
  const canvas = section.querySelector<HTMLCanvasElement>('canvas[data-rock-canvas]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const LAST = 360;
  const STEP = 2;
  const count = LAST / STEP + 1;
  const frames: (HTMLImageElement | null)[] = new Array(count).fill(null);
  const src = (i: number) => `/org/rock/${String(i * STEP).padStart(3, '0')}.webp`;

  let current = -1;
  let target = 0;
  let size = 0;

  const fit = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const s = Math.round(Math.max(1, r.width) * dpr);
    if (s !== size) {
      size = s;
      canvas.width = s;
      canvas.height = s;
      current = -1;
    }
  };

  const nearestLoaded = (i: number) => {
    if (frames[i]) return i;
    for (let d = 1; d < count; d++) {
      if (i - d >= 0 && frames[i - d]) return i - d;
      if (i + d < count && frames[i + d]) return i + d;
    }
    return -1;
  };

  const draw = () => {
    const i = nearestLoaded(target);
    if (i < 0 || i === current) return;
    current = i;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(frames[i]!, 0, 0, size, size);
  };

  // Coarse-to-fine load order: 0, 180, 90, 270, 45, ... then everything else.
  const order: number[] = [];
  const seen = new Set<number>();
  for (let stride = count - 1; stride >= 1; stride = Math.floor(stride / 2)) {
    for (let i = 0; i < count; i += stride) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
    if (stride === 1) break;
  }
  for (let i = 0; i < count; i++) if (!seen.has(i)) order.push(i);

  let inflight = 0;
  let idx = 0;
  const pump = () => {
    while (inflight < 6 && idx < order.length) {
      const i = order[idx++];
      const img = new Image();
      img.decoding = 'async';
      inflight++;
      img.onload = () => {
        frames[i] = img;
        inflight--;
        if (Math.abs(i - target) <= 2 || current < 0) {
          current = -1;
          draw();
        }
        pump();
      };
      img.onerror = () => {
        inflight--;
        pump();
      };
      img.src = src(i);
    }
  };

  // Progress runs while the pinned stone (at 50vh) travels from the top to the bottom of the rows.
  const progress = () => {
    const r = section.getBoundingClientRect();
    const pin = window.innerHeight * 0.14 + 220;
    const total = Math.max(1, r.height - 440);
    return Math.min(1, Math.max(0, (pin - r.top) / total));
  };
  const onScroll = () => {
    target = Math.round(progress() * (count - 1));
    draw();
  };

  fit();
  pump();
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener(
    'resize',
    () => {
      fit();
      draw();
    },
    { passive: true },
  );
}

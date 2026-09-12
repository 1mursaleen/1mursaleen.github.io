import { motionTier, hasWebGL } from '../../motion/prefs';

/**
 * Mounts the Drop section: a tall scroll container with a sticky canvas.
 * Progress = how far the container has scrolled through the viewport.
 * Overlay beats ([data-beat="start-end"]) fade in/out by progress range.
 */
export function mountDrop() {
  const section = document.querySelector<HTMLElement>('[data-drop]');
  if (!section) return;
  const canvas = section.querySelector<HTMLCanvasElement>('canvas');
  const tier = motionTier();
  if (!canvas || tier === 'static' || !hasWebGL()) {
    section.classList.add('drop--static');
    return;
  }

  const beats = Array.from(section.querySelectorAll<HTMLElement>('[data-beat]')).map((el) => {
    const [a, b] = (el.dataset.beat ?? '0-1').split('-').map(Number);
    return { el, a, b };
  });
  const loader = section.querySelector<HTMLElement>('[data-drop-loader]');
  const loaderText = section.querySelector<HTMLElement>('[data-drop-progress]');

  const progressOf = () => {
    const r = section.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    return total <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / total));
  };

  const updateBeats = (p: number) => {
    for (const { el, a, b } of beats) {
      const span = b - a;
      const fadeIn = a <= 0 ? 1 : Math.min(1, Math.max(0, (p - a) / (span * 0.25)));
      const fadeOut = b >= 1 ? 1 : Math.min(1, Math.max(0, (b - p) / (span * 0.25)));
      const o = Math.min(fadeIn, fadeOut);
      el.style.opacity = String(o);
      el.style.setProperty('--beat-y', `${((1 - o) * 24 * (p < (a + b) / 2 ? 1 : -1)).toFixed(1)}px`);
      el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
    }
  };
  updateBeats(0);

  const setPct = (p: number) => {
    if (loaderText) loaderText.textContent = `${Math.round(p * 100)}%`;
  };

  const start = async () => {
    const { createDropScene } = await import('./scene');
    let drop;
    try {
      drop = await createDropScene(canvas, tier, setPct);
    } catch (err) {
      console.error('[drop] failed to load scene assets', err);
      section.classList.add('drop--static');
      loader?.classList.add('is-done');
      return;
    }
    setPct(1);
    requestAnimationFrame(() => {
      loader?.classList.add('is-done');
      section.classList.add('is-live');
    });

    let visible = false;
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) drop.start();
        else drop.stop();
      },
      { rootMargin: '10% 0px 10% 0px' },
    );
    io.observe(section);

    const onScroll = () => {
      const p = progressOf();
      drop.setProgress(p);
      updateBeats(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => drop.resize(), { passive: true });
    onScroll();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) drop.stop();
      else if (visible) drop.start();
    });
  };

  // Start right away: the section is the first thing on screen.
  setTimeout(() => void start(), 50);
}

import { ensureGsap, gsap, ScrollTrigger } from './gsap';
import { motionTier, watchReducedMotion } from './prefs';
import { createLenis, destroyLenis } from './lenis';
import { initParallax, initDraw, initTilt } from './reveal';
import { initOrchestrator } from './sections/orchestrator';
import { initJourney } from './sections/journey';

let ctx: gsap.Context | null = null;

export function initMotion() {
  const tier = motionTier();
  if (tier === 'static') {
    // Everything is already visible in the HTML; nothing to do.
    return;
  }
  ensureGsap();

  const run = () => {
    ctx?.revert();
    ctx = gsap.context(() => {
      if (tier === 'full') createLenis();
      // Content is rendered in place; no scroll-triggered reveals, counters or scrambles.
      initParallax();
      initDraw();
      initTilt(tier);
      initOrchestrator(tier);
      initJourney();
      // Fonts can change line breaks; refresh once they are in.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }

  watchReducedMotion((next) => {
    if (next === 'static') {
      ctx?.revert();
      destroyLenis();
      ScrollTrigger.killAll();
    }
  });
}

export function teardownMotion() {
  ctx?.revert();
  destroyLenis();
  ScrollTrigger.killAll();
}

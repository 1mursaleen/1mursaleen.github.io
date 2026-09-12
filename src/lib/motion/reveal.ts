import { gsap, SplitText } from './gsap';
import type { MotionTier } from './prefs';

const formatters = {
  int: (n: number) => Math.round(n).toLocaleString('en-US'),
  compact: (n: number) => `${Math.round(n)}M`,
  currency: (n: number) => `$${Math.round(n)}B`,
  text: (_: number, original: string) => original,
};

/** data-reveal="lines|words|chars|fade" */
export function initReveals(tier: MotionTier) {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  els.forEach((el) => {
    const mode = el.dataset.reveal ?? 'fade';
    const trigger = { trigger: el, start: 'top 88%', once: true };

    if (mode === 'fade' || tier === 'lite') {
      gsap.from(el, { autoAlpha: 0, y: 28, duration: 1.1, scrollTrigger: trigger });
      return;
    }

    const type = mode === 'chars' ? 'chars,words,lines' : mode === 'words' ? 'words,lines' : 'lines';
    const split = SplitText.create(el, {
      type,
      linesClass: 'split-line',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(mode === 'chars' ? self.chars : mode === 'words' ? self.words : self.lines, {
          yPercent: 110,
          rotate: mode === 'lines' ? 0.001 : 0,
          duration: 1.2,
          stagger: mode === 'chars' ? 0.015 : mode === 'words' ? 0.04 : 0.09,
          ease: 'power4.out',
          scrollTrigger: trigger,
        }),
    });
    void split;
  });
}

/** data-counter="494" data-counter-format="int|compact|currency|text" */
export function initCounters() {
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
    const target = Number(el.dataset.counter);
    if (!Number.isFinite(target)) return;
    const fmt = (el.dataset.counterFormat ?? 'int') as keyof typeof formatters;
    const original = el.textContent ?? '';
    const state = { v: 0 };
    gsap.to(state, {
      v: target,
      duration: 2.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => {
        el.textContent = formatters[fmt](state.v, original);
      },
      onComplete: () => {
        el.textContent = original;
      },
    });
  });
}

/** data-scramble: scramble in once when visible. data-scramble-hover: scramble on hover. */
export function initScramble() {
  document.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => {
    const text = el.textContent ?? '';
    gsap.to(el, {
      duration: 1.4,
      scrambleText: { text, chars: 'upperCase', speed: 0.6, revealDelay: 0.2 },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
  document.querySelectorAll<HTMLElement>('[data-scramble-hover]').forEach((el) => {
    const html = el.innerHTML;
    const text = el.textContent ?? '';
    el.addEventListener('mouseenter', () => {
      gsap.to(el, {
        duration: 0.9,
        scrambleText: { text, chars: '01', speed: 1 },
        onComplete: () => {
          el.innerHTML = html;
        },
      });
    });
  });
}

/** data-parallax="0.2" moves the element by 20% of scroll distance through the viewport. */
export function initParallax() {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const f = Number(el.dataset.parallax ?? 0.2);
    gsap.to(el, {
      yPercent: -100 * f,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/** data-draw on an SVG path draws it via stroke-dashoffset while scrubbing. */
export function initDraw() {
  document.querySelectorAll<SVGPathElement>('path[data-draw]').forEach((path) => {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: { trigger: path.closest('section') ?? path, start: 'top 75%', end: 'bottom 60%', scrub: 0.5 },
    });
  });
}

/** data-tilt: subtle 3D tilt following the pointer (desktop only). */
export function initTilt(tier: MotionTier) {
  if (tier !== 'full') return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    const qx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' });
    const qy = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });
    gsap.set(card, { transformPerspective: 900 });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      qx(-py * 6);
      qy(px * 6);
    });
    card.addEventListener('pointerleave', () => {
      qx(0);
      qy(0);
    });
  });
}

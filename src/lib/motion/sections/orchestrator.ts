import { gsap } from '../gsap';
import type { MotionTier } from '../prefs';

/**
 * Animates the orchestrator SVG: edges draw in, then accent tokens (PRs) flow
 * along the pipeline in a slow loop while the section is in view.
 */
export function initOrchestrator(tier: MotionTier) {
  const fig = document.querySelector<HTMLElement>('[data-orchestrator]');
  if (!fig) return;
  const edges = Array.from(fig.querySelectorAll<SVGPathElement>('.orch__edge'));
  const nodes = Array.from(fig.querySelectorAll<SVGGElement>('.orch__node'));
  const tokens = Array.from(fig.querySelectorAll<SVGCircleElement>('.orch__token'));

  // Diagram is fully visible on load; only the pulses animate.
  const introDone = true;
  // Continuous "neurons": several pulses per edge, travelling end to end on staggered phases.
  const NS = 'http://www.w3.org/2000/svg';
  const layer = fig.querySelector<SVGGElement>('.orch__tokens');
  tokens.forEach((t) => t.remove());
  const perEdge = tier === 'full' ? 3 : 2;
  type Pulse = { el: SVGCircleElement; path: SVGPathElement; len: number; phase: number; speed: number };
  const pulses: Pulse[] = [];
  edges.forEach((path, ei) => {
    const len = path.getTotalLength();
    for (let k = 0; k < perEdge; k++) {
      const el = document.createElementNS(NS, 'circle');
      el.setAttribute('r', String(3.2 + Math.random() * 2));
      el.setAttribute('class', 'orch__token');
      el.style.opacity = '0';
      layer?.appendChild(el);
      pulses.push({ el, path, len, phase: (k / perEdge + ei * 0.137) % 1, speed: 0.22 + Math.random() * 0.16 });
    }
  });
  let running = false;
  const tick = (_t: number, dt: number) => {
    if (!running || !introDone) return;
    const step = dt / 1000;
    for (const p of pulses) {
      p.phase = (p.phase + step * p.speed) % 1;
      const pt = p.path.getPointAtLength(p.phase * p.len);
      p.el.setAttribute('cx', String(pt.x));
      p.el.setAttribute('cy', String(pt.y));
      // fade in/out at the ends so pulses appear to fire from node to node
      const fade = Math.min(1, p.phase / 0.12, (1 - p.phase) / 0.12);
      p.el.style.opacity = String(0.25 + fade * 0.75);
    }
  };
  gsap.ticker.add(tick);
  const io = new IntersectionObserver(
    ([e]) => {
      running = e.isIntersecting;
    },
    { threshold: 0.1 },
  );
  io.observe(fig);
  // durable-state node breathes while active
  const files = fig.querySelector<SVGRectElement>('.orch__node--files rect');
  if (files) gsap.to(files, { strokeWidth: 3.5, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
}

import { ScrollTrigger } from '../gsap';

/**
 * As each era scrolls into view, announce its place so the globe scene can
 * fly there, and update the sticky caption. Emits a CustomEvent on window.
 */
export function initJourney() {
  const eras = document.querySelectorAll<HTMLElement>('.journey__era[data-place]');
  const caption = document.querySelector<HTMLElement>('[data-journey-place]');
  if (!eras.length) return;
  eras.forEach((era) => {
    const place = era.dataset.place!;
    const name = era.querySelector('.journey__meta .mono-sm')?.textContent ?? place;
    ScrollTrigger.create({
      trigger: era,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (!self.isActive) return;
        if (caption) caption.textContent = name;
        window.dispatchEvent(new CustomEvent('journey:place', { detail: { place } }));
      },
    });
  });
}

/**
 * Progressive enhancement for <abbr title>: moves the title into data-tip so the
 * native tooltip does not double up, makes each abbreviation keyboard-focusable,
 * and nudges the bubble so it stays inside the viewport.
 */
export function initAbbrTips() {
  const items = document.querySelectorAll<HTMLElement>('abbr[title]');
  items.forEach((el) => {
    const tip = el.getAttribute('title');
    if (!tip) return;
    el.dataset.tip = tip;
    el.removeAttribute('title');
    el.setAttribute('aria-label', `${el.textContent?.trim()} (${tip})`);
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    const place = () => {
      const r = el.getBoundingClientRect();
      const half = Math.min(30 * 8, window.innerWidth * 0.78) / 2;
      const cx = r.left + r.width / 2;
      const gutter = 12;
      let shift = 0;
      if (cx - half < gutter) shift = gutter - (cx - half);
      else if (cx + half > window.innerWidth - gutter) shift = window.innerWidth - gutter - (cx + half);
      el.style.setProperty('--tip-shift', `${Math.round(shift)}px`);
      el.toggleAttribute('data-tip-below', r.top < 72);
    };
    el.addEventListener('pointerenter', place);
    el.addEventListener('focus', place);
  });
}

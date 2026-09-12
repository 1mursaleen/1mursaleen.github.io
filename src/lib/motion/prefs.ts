export type MotionTier = 'full' | 'lite' | 'static';

export function motionTier(): MotionTier {
  const attr = document.documentElement.getAttribute('data-motion-tier');
  if (attr === 'full' || attr === 'lite' || attr === 'static') return attr;
  return computeTier();
}

export function motionOff(): boolean {
  try {
    return localStorage.getItem('motion') === 'off';
  } catch {
    return false;
  }
}

export function setMotionOff(off: boolean) {
  try {
    if (off) localStorage.setItem('motion', 'off');
    else localStorage.removeItem('motion');
  } catch {
    /* ignore */
  }
}

export function computeTier(): MotionTier {
  if (motionOff()) return 'static';
  const coarse = matchMedia('(pointer: coarse)').matches;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const lowMem = (nav.deviceMemory ?? 8) < 4;
  const save = !!nav.connection?.saveData;
  return coarse || lowMem || save ? 'lite' : 'full';
}

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Re-evaluate the tier when the site toggle changes (fires from the footer control). */
export function watchReducedMotion(cb: (tier: MotionTier) => void) {
  window.addEventListener('motion:toggle', () => {
    const tier = computeTier();
    document.documentElement.setAttribute('data-motion-tier', tier);
    cb(tier);
  });
}

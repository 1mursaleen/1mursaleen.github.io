import { ABBR, ABBR_KEYS } from '../data/abbr';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
// Word-boundary match that tolerates hyphens/slashes inside keys and an optional plural "s".
export const ABBR_RE = new RegExp(`(?<![\\w/-])(${ABBR_KEYS.map(esc).join('|')})(s?)(?![\\w/-])`, 'g');

/** Plain-text expansion: first use per `seen` set becomes "Full form (ABBR)". */
export function expandText(text: string, seen: Set<string> = new Set()): string {
  return text.replace(ABBR_RE, (m, key: string, plural: string, offset: number, whole: string) => {
    const full = ABBR[key];
    if (!full) return m;
    // Skip if the full form is already right before this token: "Full form (ABBR)".
    const before = whole.slice(Math.max(0, offset - full.length - 3), offset);
    if (before.toLowerCase().includes(full.toLowerCase())) {
      seen.add(key);
      return m;
    }
    if (seen.has(key)) return m;
    seen.add(key);
    return `${full}${plural ? 's' : ''} (${key}${plural})`;
  });
}

// Verifies that every abbreviation in src/data/abbr.ts has a full form (or <abbr title>) on every built page.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const src = await readFile(new URL('../src/data/abbr.ts', import.meta.url), 'utf8');
const ABBR = Object.fromEntries([...src.matchAll(/^\s+'?([\w/-]+)'?:\s+(['"])(.*?)\2,$/gm)].map((m) => [m[1], m[3]]));
const keys = Object.keys(ABBR).sort((a, b) => b.length - a.length);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const re = new RegExp(`(?<![\\w/-])(${keys.map(esc).join('|')})(s?)(?![\\w/-])`, 'g');

async function walk(d) {
  const out = [];
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
const strip = (html) =>
  html
    .replace(/<(script|style|svg|title|code|pre)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<abbr\b[^>]*>[\s\S]*?<\/abbr>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');

let bad = 0;
for (const f of await walk('dist')) {
  const text = strip(await readFile(f, 'utf8'));
  for (const m of text.matchAll(re)) {
    const key = m[1];
    const full = ABBR[key].toLowerCase();
    const before = text.slice(0, m.index).toLowerCase();
    if (!before.includes(full)) {
      // The first expanded use reads "Full form (ABBR)"; tolerate a token that sits inside its own full form.
      const near = text.slice(Math.max(0, m.index - full.length - 4), m.index + full.length + 4).toLowerCase();
      if (!near.includes(full)) {
        bad++;
        console.log(`${f}: "${key}" without full form — …${text.slice(Math.max(0, m.index - 60), m.index + 20).replace(/\s+/g, ' ')}…`);
      }
    }
  }
}
console.log(bad ? `${bad} violations` : 'abbreviations OK');
process.exit(bad ? 1 : 0);

import type { AstroIntegration } from 'astro';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ABBR } from '../data/abbr';
import { ABBR_RE } from '../lib/abbr';

const SKIP = new Set(['script', 'style', 'code', 'pre', 'abbr', 'title', 'svg', 'textarea']);
const HEADINGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const VOID = new Set(['br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'path', 'circle', 'rect', 'use']);

/**
 * Rewrites text nodes so the first occurrence of each abbreviation on a page reads
 * "Full form (ABBR)" and later ones are wrapped in <abbr title="Full form">. Headings
 * and display text never receive the long expansion; they get the <abbr> form and the
 * expansion falls to the first body occurrence.
 */
export function abbrHtml(html: string): string {
  const seen = new Set<string>();
  const stack: string[] = [];
  // Raw-text elements are taken whole so a stray '<' or '>' in JS/CSS cannot desync the tag stack.
  const parts = html.match(/<script\b[\s\S]*?<\/script\s*>|<style\b[\s\S]*?<\/style\s*>|<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) ?? [html];
  const out: string[] = [];
  const skipDepth = () => stack.some((t) => SKIP.has(t));
  const inHeading = () => stack.some((t) => HEADINGS.has(t));
  for (const part of parts) {
    if (part.startsWith('<')) {
      if (/^<(script|style)\b/i.test(part) || part.startsWith('<!--')) {
        out.push(part);
        continue;
      }
      const m = part.match(/^<\/?([a-zA-Z][\w:-]*)/);
      if (m && !part.startsWith('<!')) {
        const tag = m[1].toLowerCase();
        if (part.startsWith('</')) {
          const i = stack.lastIndexOf(tag);
          if (i >= 0) stack.splice(i);
        } else if (!VOID.has(tag) && !part.endsWith('/>')) {
          stack.push(tag);
        }
      }
      out.push(part);
      continue;
    }
    if (!part.trim() || skipDepth()) {
      out.push(part);
      continue;
    }
    const heading = inHeading();
    out.push(
      part.replace(ABBR_RE, (m, key: string, plural: string, offset: number, whole: string) => {
        const full = ABBR[key];
        if (!full) return m;
        const before = whole.slice(Math.max(0, offset - full.length - 3), offset).toLowerCase();
        if (before.includes(full.toLowerCase())) {
          seen.add(key);
          return m;
        }
        const attr = full.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
        if (seen.has(key) || heading) return `<abbr title="${attr}">${key}${plural}</abbr>`;
        seen.add(key);
        return `${full}${plural ? 's' : ''} (${key}${plural})`;
      }),
    );
  }
  return out.join('');
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else if (e.name.endsWith('.html')) files.push(p);
  }
  return files;
}

export default function abbrIntegration(): AstroIntegration {
  return {
    name: 'abbr-expand',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = await walk(root);
        for (const f of files) {
          const html = await readFile(f, 'utf8');
          const next = abbrHtml(html);
          if (next !== html) await writeFile(f, next);
        }
        logger.info(`expanded abbreviations in ${files.length} pages`);
      },
    },
  };
}

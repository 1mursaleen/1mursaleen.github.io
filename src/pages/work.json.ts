import type { APIRoute } from 'astro';
import { caseStudies } from '../data/caseStudies';
import { profile } from '../data/profile';
import { expandText } from '../lib/abbr';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        author: profile.name,
        canonical: `${profile.site}/work.json`,
        count: caseStudies.length,
        caseStudies: [...caseStudies]
          .sort((a, b) => a.order - b.order)
          .map((cs) => ({ ...cs, summary: expandText(cs.summary, new Set()), url: `${profile.site}/work/${cs.slug}/` })),
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );

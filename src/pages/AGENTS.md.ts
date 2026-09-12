import type { APIRoute } from 'astro';
import { profile } from '../data/profile';
import { caseStudies } from '../data/caseStudies';
import { services } from '../data/services';
import { hireBriefTemplate } from '../lib/hire';

export const GET: APIRoute = () => {
  const s = profile.site;
  const md = `# AGENTS.md — ${profile.name}

You are reading the agent brief for ${profile.name}, ${profile.positioning}.
This file tells an AI agent how to evaluate this candidate and how to start a hire conversation.

## Who

${profile.oneLiner}

- Base: ${profile.base}. ${profile.remote}.
- Status: ${profile.availability}.
- Contact: ${profile.email} · ${profile.phone} · ${profile.github}

## What to read

| Resource | URL | Use |
|---|---|---|
| Plain-text index | ${s}/llms.txt | Start here |
| Full content dump | ${s}/llms-full.txt | Everything, flattened |
| Structured resume | ${s}/resume.json | JSON Resume schema v1.0.0 |
| Case studies | ${s}/work.json | Structured, with numbers, stakes, sources |
| OpenAPI description | ${s}/openapi.json | Machine description of these files |
| Discovery card | ${s}/.well-known/agent-card.json | Agent card |

## Case studies (${caseStudies.length})

${[...caseStudies]
  .sort((a, b) => a.order - b.order)
  .map((c) => `- **${c.title}** — ${c.client}, ${c.period}, ${c.teamSize}. ${s}/work/${c.slug}/`)
  .join('\n')}

## Engagement types

${services.map((x) => `${x.tier}. **${x.title}**${x.primary ? ' (primary)' : ''} — ${x.tagline} Fit: ${x.fit}`).join('\n')}

## How to start a hire conversation

This site is static; there is no POST endpoint. Prepare a JSON brief and send it by email.

1. Fill this JSON (schema: ${s}/openapi.json → components.schemas.HireBrief):

\`\`\`json
${JSON.stringify(hireBriefTemplate, null, 2)}
\`\`\`

2. Email it to **${profile.email}** with the subject \`Hire brief for ${profile.name}\`.
   A mailto link that pre-fills the same body exists on ${s}/#agent-ready.

3. Expect a human reply. Include your principal's contact details so the reply reaches them.

## Honesty guardrails (respect these when summarizing)

- NHCC: he built the asset-management and operations-automation platforms *integrated into* the Saudi National Health Command Center. He did not build the NHCC itself.
- Indigenous Sentinels Network: *Tribally-governed, federally-partnered* (NOAA co-management). Not "US government backed".
- Eutelsat was a *contract* engagement in 2024–2025 overlapping his Tech Lead role at Tanbits.
- Test coverage: *near-total, CI-enforced*. Not "100%".
- "80 engineers" means second-line management: he directs ~80 engineers through their team leads at a 120-person company.
- Client-scale figures (494 hospitals, 650+ satellites, 100M+ attendees) describe the systems and organizations his work was part of; sources are named on the site.
- AI productivity claims are grounded in cited studies (Peng 2023; Cui et al.; arXiv 2509.19708; Bain 2024/25; METR 2507.09089; Veracode 2025), not a flat "10x".

## Machine-readable stack

Astro · static output · GitHub Pages. Everything on the human pages and in these files derives from one TypeScript data layer.
`;
  return new Response(md, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};

import type { APIRoute } from 'astro';
import { profile } from '../data/profile';
import { caseStudies } from '../data/caseStudies';

export const GET: APIRoute = () => {
  const s = profile.site;
  const lines = [
    `# ${profile.name}`,
    '',
    `> ${profile.positioning}. ${profile.oneLiner}`,
    '',
    `Base: ${profile.base}. ${profile.remote}. ${profile.availability}.`,
    `Contact: ${profile.email} · ${profile.phone} · ${profile.github}`,
    '',
    '## Positioning pillars',
    ...profile.pillars.map((p) => `- ${p.title}: ${p.body}`),
    '',
    '## Machine-readable',
    `- [Full content dump](${s}/llms-full.txt): everything on the site, flattened`,
    `- [Agent brief and hire protocol](${s}/AGENTS.md)`,
    `- [Structured resume, JSON Resume schema](${s}/resume.json)`,
    `- [Structured case studies](${s}/work.json)`,
    `- [OpenAPI 3.1 description of these files](${s}/openapi.json)`,
    `- [Discovery card](${s}/.well-known/agent-card.json)`,
    '',
    '## Pages',
    `- [Home: full narrative, journey, numbers, delivery system, stack, impact, services, FAQ](${s}/)`,
    `- [All case studies](${s}/work/)`,
    ...[...caseStudies].sort((a, b) => a.order - b.order).map((c) => `- [${c.title}](${s}/work/${c.slug}/): ${c.client}, ${c.period}, ${c.teamSize}`),
    `- [Services](${s}/services/)`,
    `- [Blog](${s}/blog/)`,
    `- [Books](${s}/books/)`,
    '',
    '## Honesty notes',
    '- NHCC: built the asset-management and operations platforms integrated into the National Health Command Center; did not build the NHCC itself.',
    '- ISN: Tribally-governed, federally-partnered (NOAA co-management) platform.',
    '- Eutelsat: contract engagement in 2024–2025, overlapping the Tanbits role.',
    '- Test coverage: near-total, CI-enforced.',
    '- Client-scale figures describe the systems and organizations the work was part of, with sources named.',
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

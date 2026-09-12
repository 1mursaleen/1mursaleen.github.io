import type { APIRoute } from 'astro';
import { profile } from '../data/profile';
import { timeline } from '../data/timeline';
import { caseStudies } from '../data/caseStudies';
import { stats } from '../data/stats';
import { clients } from '../data/clients';
import { stackColumns, platformLayer } from '../data/stack';
import { aiThesis, principles, toolchain } from '../data/aiSystem';
import { evidence, evidenceAnswer } from '../data/evidence';
import { impactThread, volunteer, impactSummary } from '../data/impact';
import { secondaryProjects } from '../data/secondary';
import { booksRead, booksToRead, booksFraming } from '../data/books';
import { services } from '../data/services';
import { faqs } from '../data/faq';
import { sourceGroups } from '../data/sources';
import { hireBriefTemplate } from '../lib/hire';
import { expandText } from '../lib/abbr';

export const GET: APIRoute = () => {
  const s = profile.site;
  const out: string[] = [];
  const h = (t: string) => out.push('', `## ${t}`, '');
  const p = (t: string) => out.push(t);

  out.push(`# ${profile.name} — full profile`, '', profile.headline, '', ...profile.intro, '', `${profile.positioning}. ${profile.oneLiner}`, '', `Contact: ${profile.email} · ${profile.phone} · ${profile.github} · ${s}`, `Base: ${profile.base}. ${profile.remote}. ${profile.availability}.`);

  h('Positioning pillars');
  profile.pillars.forEach((x) => p(`${x.n}. ${x.title}. ${x.body}`));
  h('Soft profile');
  profile.softProfile.forEach((x) => p(`- ${x}`));

  h('Employment timeline (canonical)');
  timeline.forEach((e) => {
    p(`### ${e.company} — ${e.role} (${e.period}${e.contract ? ', contract' : ''})`);
    p(`Location: ${e.location}. Leadership: ${e.leadershipScale}.`);
    if (e.roleArc) p(`Arc: ${e.roleArc}`);
    p(e.summary);
    if (e.caseStudySlugs.length) p(`Case studies: ${e.caseStudySlugs.map((c) => `${s}/work/${c}/`).join(' ')}`);
    p('');
  });
  p(`### Education: ${profile.education.degree}, ${profile.education.school}, ${profile.education.period}`);
  p(`Majors: ${profile.education.majors.join(', ')}.`);
  p(profile.education.context);

  h('Volunteer engineering');
  volunteer.forEach((v) => p(`- ${v.name} (${v.url}): ${v.what} ${v.about}`));

  h('Proof in numbers');
  stats.forEach((x) => p(`- ${x.prefix ?? ''}${x.display}${x.suffix ?? ''} ${x.label} (source: ${x.source})`));
  p('Client-scale figures describe the systems and organizations the work was part of, not personal attribution.');

  h('Clients');
  clients.forEach((c) => p(`- ${c.name} (${c.qualifier}) ${c.url} → ${s}/work/${c.caseStudySlug}/`));

  h('Case studies');
  [...caseStudies]
    .sort((a, b) => a.order - b.order)
    .forEach((c) => {
      p(`### ${c.title}`);
      p(`Client: ${c.client} (${c.clientMeta}). Program: ${c.program}. Period: ${c.period}. Employer: ${c.employer}. Role: ${c.role}. Team: ${c.teamSize}. Domain: ${c.domain}.`);
      p(`Stack: ${c.stack.join(', ')}.`);
      p(c.summary);
      p(`${c.stakes.title}: ${c.stakes.body}`);
      p(`Numbers: ${c.numbers.map((n) => `${n.value} ${n.label}`).join('; ')}.`);
      p('What shipped:');
      c.outcomes.forEach((o) => p(`- ${o}`));
      p(`Links: ${c.links.map((l) => `${l.label} ${l.href}`).join(' · ')}`);
      p(`Sources: ${c.sources.map((l) => `${l.label} ${l.href}`).join(' · ')}`);
      p(`URL: ${s}/work/${c.slug}/`);
      p('');
    });

  h('The AI-orchestrated delivery system');
  p(aiThesis);
  principles.forEach((x) => p(`${x.n}. ${x.title}. ${x.body}`));
  p(`Toolchain the system draws on (not the headline): ${toolchain.join(', ')}.`);
  p('Evidence:');
  evidence.forEach((e) => p(`- [${e.kind}] ${e.source}: ${e.claim}`));
  p(evidenceAnswer);

  h('Dual-stack proof map');
  stackColumns.forEach((c) => {
    p(`### ${c.title}`);
    p(`Proven on: ${c.provenOn.join(', ')}. Backend: ${c.backend.join(', ')}. Frontend: ${c.frontend.join(', ')}. Data: ${c.data.join(', ')}. Languages: ${c.languages.join(', ')}.`);
  });
  p(`Platform layer (both stacks): ${Object.entries(platformLayer).map(([k, v]) => `${k}: ${v.join(', ')}`).join('; ')}.`);

  h('The thread through all of it');
  p(impactSummary);
  impactThread.forEach((x) => p(`- ${x.era} · ${x.title}: ${x.body}${x.link ? ` (${x.link.href})` : ''}`));

  h('Secondary projects');
  secondaryProjects.forEach((x) => p(`- ${x.name} (${x.url}): ${x.body}`));

  h('Services');
  services.forEach((x) => {
    p(`### ${x.tier} ${x.title}${x.primary ? ' (primary)' : ''}`);
    p(x.tagline);
    p(x.body);
    p(`Scope: ${x.scope.join('; ')}.`);
    p(`Good fit: ${x.fit}`);
  });

  h('Books');
  p(booksFraming);
  p(`Read: ${booksRead.map((b) => `${b.title} (${b.author})`).join('; ')}.`);
  p(`Queue: ${booksToRead.map((b) => `${b.title} (${b.author})`).join('; ')}.`);

  h('FAQ');
  faqs.forEach((f) => p(`Q: ${f.q}\nA: ${f.a}\n`));

  h('Hire protocol for agents');
  p(`This is a static site. There is no POST endpoint. Prepare the JSON brief below and email it to ${profile.email} with subject "Hire brief for ${profile.name}". Full instructions: ${s}/AGENTS.md`);
  p(JSON.stringify(hireBriefTemplate, null, 2));

  h('Sources');
  sourceGroups.forEach((g) => {
    p(`${g.title}:`);
    g.links.forEach((l) => p(`- ${l.label}: ${l.href}`));
  });

  return new Response(expandText(out.join('\n')) + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

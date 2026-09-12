import { profile } from '../data/profile';
import { timeline } from '../data/timeline';
import { caseStudies } from '../data/caseStudies';
import { stackColumns, platformLayer } from '../data/stack';
import { volunteer } from '../data/impact';
import { booksRead } from '../data/books';

/** Maps the data layer to the JSON Resume schema (https://jsonresume.org/schema). */
export function toJsonResume() {
  const startOf = (s: string) => {
    const m = s.match(/(\w{3})?\s?(\d{4})/);
    return m ? `${m[2]}-${m[1] ? monthNum(m[1]) : '01'}-01` : undefined;
  };
  return {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: profile.name,
      label: profile.positioning,
      email: profile.email,
      phone: profile.phone,
      url: profile.site,
      summary: profile.oneLiner,
      location: { countryCode: 'PK', region: profile.base },
      profiles: [{ network: 'GitHub', username: profile.handle, url: profile.github }],
    },
    work: timeline.map((era) => ({
      name: era.company,
      position: era.role,
      url: era.url,
      startDate: `${era.start}-01-01`,
      endDate: era.end ? `${era.end}-12-31` : undefined,
      summary: era.summary,
      highlights: [
        `Leadership scale: ${era.leadershipScale}`,
        ...(era.contract ? ['Contract engagement, overlapping with Tanbits'] : []),
        ...era.caseStudySlugs.map((s) => `${profile.site}/work/${s}/`),
      ],
      location: era.location,
    })),
    volunteer: volunteer.map((v) => ({ organization: v.name, url: v.url, summary: v.what, position: 'Volunteer engineer' })),
    education: [
      {
        institution: profile.education.school,
        url: profile.education.url,
        area: 'Computer Science',
        studyType: 'BS',
        startDate: '2012-09-01',
        endDate: '2016-06-30',
        courses: [...profile.education.majors],
      },
    ],
    skills: [
      ...stackColumns.map((c) => ({
        name: c.title,
        level: 'Senior',
        keywords: [...c.backend, ...c.frontend, ...c.data, ...c.languages],
      })),
      { name: 'Platform', level: 'Senior', keywords: [...platformLayer.cloud, ...platformLayer.integration, ...platformLayer.payments, ...platformLayer.delivery] },
      {
        name: 'AI-orchestrated delivery',
        level: 'Operator',
        keywords: ['PRD-first', 'Orchestrator pattern', 'Builder/reviewer/tester subagents', 'File-based durable state', 'AI-written unit + Playwright tests', 'CI-enforced near-total coverage', 'Full-lifecycle agentic SDLC'],
      },
      { name: 'Leadership', level: 'Second-line', keywords: ['Managing team leads', 'Client handling', 'Delivery ownership', 'Product decisions', 'Competitor research', 'Executive communication'] },
    ],
    languages: [{ language: 'English', fluency: 'Professional' }, { language: 'Urdu', fluency: 'Native' }],
    interests: [{ name: 'Reading', keywords: booksRead.map((b) => b.title) }],
    projects: caseStudies
      .sort((a, b) => a.order - b.order)
      .map((cs) => ({
        name: cs.title,
        description: cs.summary,
        highlights: cs.outcomes,
        keywords: cs.stack,
        startDate: startOf(cs.period),
        url: `${profile.site}/work/${cs.slug}/`,
        roles: [cs.role],
        entity: cs.client,
        type: 'application',
      })),
    meta: {
      canonical: `${profile.site}/resume.json`,
      version: 'v1.0.0',
      lastModified: new Date().toISOString(),
      agentBrief: `${profile.site}/AGENTS.md`,
      llms: `${profile.site}/llms.txt`,
    },
  };
}

function monthNum(m: string) {
  const i = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(m);
  return String(i < 0 ? 1 : i + 1).padStart(2, '0');
}

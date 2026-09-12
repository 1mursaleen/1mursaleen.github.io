import type { APIRoute } from 'astro';
import { profile } from '../data/profile';
import { hireBriefSchema } from '../lib/hire';

export const GET: APIRoute = () => {
  const doc = {
    openapi: '3.1.0',
    info: {
      title: `${profile.name} — portfolio resources`,
      version: '1.0.0',
      summary: 'Static, machine-readable profile of an engineering leader.',
      description:
        'All resources are static GET files published by an Astro site on GitHub Pages. There is no server; hiring is initiated out-of-band by email using the HireBrief schema. See /AGENTS.md.',
      contact: { name: profile.name, email: profile.email, url: profile.site },
    },
    servers: [{ url: profile.site }],
    paths: {
      '/AGENTS.md': get('Agent brief and hire protocol', 'text/markdown'),
      '/llms.txt': get('Plain-text index for LLM agents', 'text/plain'),
      '/llms-full.txt': get('Full flattened content', 'text/plain'),
      '/resume.json': get('Structured resume (JSON Resume v1.0.0)', 'application/json', { $ref: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json' }),
      '/work.json': get('Structured case studies', 'application/json', { $ref: '#/components/schemas/WorkIndex' }),
      '/.well-known/agent-card.json': get('Discovery card', 'application/json'),
      '/sitemap-index.xml': get('Sitemap', 'application/xml'),
    },
    components: {
      schemas: {
        HireBrief: hireBriefSchema,
        WorkIndex: {
          type: 'object',
          properties: {
            author: { type: 'string' },
            canonical: { type: 'string', format: 'uri' },
            count: { type: 'integer' },
            caseStudies: { type: 'array', items: { $ref: '#/components/schemas/CaseStudy' } },
          },
        },
        CaseStudy: {
          type: 'object',
          required: ['slug', 'title', 'client', 'period', 'role', 'summary', 'url'],
          properties: {
            slug: { type: 'string' },
            order: { type: 'integer' },
            title: { type: 'string' },
            client: { type: 'string' },
            clientMeta: { type: 'string' },
            program: { type: 'string' },
            period: { type: 'string' },
            employer: { type: 'string' },
            role: { type: 'string' },
            teamSize: { type: 'string' },
            domain: { type: 'string' },
            stack: { type: 'array', items: { type: 'string' } },
            summary: { type: 'string' },
            stakes: { type: 'object', properties: { title: { type: 'string' }, body: { type: 'string' } } },
            numbers: { type: 'array', items: { type: 'object', properties: { value: { type: 'string' }, label: { type: 'string' } } } },
            outcomes: { type: 'array', items: { type: 'string' } },
            links: { type: 'array', items: { $ref: '#/components/schemas/Link' } },
            sources: { type: 'array', items: { $ref: '#/components/schemas/Link' } },
            url: { type: 'string', format: 'uri' },
          },
        },
        Link: { type: 'object', properties: { label: { type: 'string' }, href: { type: 'string', format: 'uri' } } },
      },
    },
    'x-hire-protocol': {
      transport: 'email',
      to: profile.email,
      subject: `Hire brief for ${profile.name}`,
      bodySchema: '#/components/schemas/HireBrief',
      instructions: `${profile.site}/AGENTS.md`,
    },
  };
  return new Response(JSON.stringify(doc, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};

function get(summary: string, mediaType: string, schema?: Record<string, unknown>) {
  return {
    get: {
      summary,
      responses: {
        '200': {
          description: summary,
          content: { [mediaType]: schema ? { schema } : {} },
        },
      },
    },
  };
}

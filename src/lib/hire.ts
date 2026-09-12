import { profile } from '../data/profile';

export interface HireBrief {
  name: string;
  contact: string;
  company: string;
  engagement: 'leadership-role' | 'fixed-scope-delivery' | 'advisory' | 'other';
  brief: string;
  budget: string;
  timeline: string;
  agent: string;
}

export const hireBriefTemplate: HireBrief = {
  name: '<your name>',
  contact: '<email or phone>',
  company: '<company and what it does>',
  engagement: 'leadership-role',
  brief: '<the role or the product/module scope, team size, stack, what success looks like>',
  budget: '<range and currency>',
  timeline: '<start date, duration>',
  agent: '<agent name/model that prepared this brief, or "human">',
};

export const hireBriefSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: `${profile.site}/hire-brief.schema.json`,
  title: 'HireBrief',
  type: 'object',
  required: ['name', 'contact', 'brief'],
  properties: {
    name: { type: 'string' },
    contact: { type: 'string', description: 'Email or phone the reply should go to' },
    company: { type: 'string' },
    engagement: { type: 'string', enum: ['leadership-role', 'fixed-scope-delivery', 'advisory', 'other'] },
    brief: { type: 'string' },
    budget: { type: 'string' },
    timeline: { type: 'string' },
    agent: { type: 'string', description: 'Which agent prepared this, or "human"' },
  },
} as const;

export function buildHireBody(brief: Partial<HireBrief> = {}): string {
  const merged = { ...hireBriefTemplate, ...brief };
  return `Hi Mursaleen,\n\nHere is a hire brief.\n\n${JSON.stringify(merged, null, 2)}\n`;
}

export function buildMailto(brief: Partial<HireBrief> = {}, subject = 'Hire brief for M. Mursaleen'): string {
  const body = buildHireBody(brief);
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

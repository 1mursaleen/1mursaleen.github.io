export type PlaceId =
  | 'islamabad'
  | 'dubai'
  | 'riyadh'
  | 'paris'
  | 'munich'
  | 'st-paul-island'
  | 'toronto'
  | 'coppell'
  | 'lahore';

export interface Place {
  id: PlaceId;
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export interface Link {
  label: string;
  href: string;
}

export interface TimelineEra {
  id: string;
  period: string;
  start: number;
  end: number | null;
  company: string;
  companyShort: string;
  location: string;
  placeId: PlaceId;
  role: string;
  roleArc?: string;
  contract?: boolean;
  teamSize: number;
  leadershipScale: string;
  summary: string;
  caseStudySlugs: string[];
  url?: string;
}

export type StatFormat = 'int' | 'compact' | 'currency' | 'text';

export interface Stat {
  id: string;
  value: number | null;
  display: string;
  prefix?: string;
  suffix?: string;
  format: StatFormat;
  label: string;
  source: string;
}

export interface Client {
  id: string;
  name: string;
  qualifier: string;
  url: string;
  caseStudySlug: string;
}

export interface CaseStudy {
  slug: string;
  order: number;
  title: string;
  client: string;
  clientMeta: string;
  program: string;
  period: string;
  employer: string;
  role: string;
  teamSize: string;
  domain: string;
  placeIds: PlaceId[];
  stack: string[];
  summary: string;
  stakes: { title: string; body: string };
  numbers: { value: string; label: string }[];
  outcomes: string[];
  links: Link[];
  sources: Link[];
  scene: 'globe' | 'satellites';
  accentWord: string;
}

export interface StackColumn {
  id: string;
  title: string;
  provenOn: string[];
  backend: string[];
  frontend: string[];
  data: string[];
  languages: string[];
}

export interface Principle {
  n: string;
  title: string;
  body: string;
}

export interface Evidence {
  id: string;
  source: string;
  claim: string;
  kind: 'support' | 'counterweight';
  ref: string;
}

export interface ImpactStop {
  id: string;
  placeId: PlaceId;
  era: string;
  title: string;
  body: string;
  link?: Link;
}

export interface Volunteer {
  name: string;
  url: string;
  what: string;
  about: string;
}

export interface Book {
  title: string;
  author: string;
}

export interface Service {
  id: string;
  tier: string;
  title: string;
  tagline: string;
  body: string;
  scope: string[];
  fit: string;
  primary?: boolean;
}

export interface Faq {
  q: string;
  a: string;
  audience: 'agents' | 'humans' | 'both';
}

export interface SecondaryProject {
  name: string;
  url: string;
  body: string;
}

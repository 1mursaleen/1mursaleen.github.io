import { profile } from '../data/profile';
import type { CaseStudy } from '../data/types';

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.positioning,
    description: profile.oneLiner,
    email: `mailto:${profile.email}`,
    telephone: profile.phone,
    url: profile.site,
    sameAs: [profile.github],
    address: { '@type': 'PostalAddress', addressCountry: 'PK' },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'National University of Computer and Emerging Sciences (FAST-NUCES)',
      url: profile.education.url,
    },
    worksFor: { '@type': 'Organization', name: 'Tanbits', url: 'https://tanbits.com' },
    knowsAbout: [
      'Engineering leadership',
      'Laravel',
      'PHP',
      'Node.js',
      'TypeScript',
      'AI-orchestrated software delivery',
      'Healthcare systems',
      'Satellite ground segment software',
    ],
  };
}

export function caseStudyJsonLd(cs: CaseStudy, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: cs.title,
    description: cs.summary,
    url,
    author: { '@type': 'Person', name: profile.name, url: profile.site },
    about: cs.client,
    keywords: cs.stack.join(', '),
  };
}

export function articleJsonLd(opts: { title: string; description: string; url: string; datePublished: string; dateModified?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: { '@type': 'Person', name: profile.name, url: profile.site },
  };
}

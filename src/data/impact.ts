import type { ImpactStop, Volunteer } from './types';

export const impactThread: ImpactStop[] = [
  {
    id: 'sdg4',
    placeId: 'dubai',
    era: '2016 – 2020',
    title: 'SDG 4 education outreach',
    body: 'EdTech for universities in underdeveloped countries, and events educating faculty and management on technology adoption. SDG-aligned work supporting Quality Education.',
    link: { label: 'UN SDG 4', href: 'https://sdgs.un.org/goals' },
  },
  {
    id: 'nhcc',
    placeId: 'riyadh',
    era: '2020 – 2022',
    title: 'Pandemic-era national health infrastructure',
    body: 'Asset performance and operations automation platforms integrated into the Saudi National Health Command Center, for a ministry, during COVID.',
    link: { label: 'NHCC', href: 'https://ascend.com.sa/projects/national-health-command-center/' },
  },
  {
    id: 'isn',
    placeId: 'st-paul-island',
    era: '2023 – Now',
    title: 'Tribally-governed, NOAA-partnered climate monitoring',
    body: 'The Indigenous Sentinels Network platform and offline-first apps, with community data sovereignty under the CARE Principles.',
    link: { label: 'ISN', href: 'https://www.sentinelsnetwork.org' },
  },
  {
    id: 'volunteer',
    placeId: 'lahore',
    era: 'Ongoing',
    title: 'Volunteer platforms in Pakistan',
    body: 'Management platforms for disaster relief, children’s cardiac care and poverty relief, built for nonprofits on my own time.',
  },
];

export const volunteer: Volunteer[] = [
  {
    name: 'Alkhidmat Foundation',
    url: 'https://alkhidmat.org/',
    what: 'Volunteered and helped build management platforms for disaster program management and education programs management.',
    about: 'One of Pakistan’s largest humanitarian NGOs: disaster response, education, health and orphan care programs nationwide.',
  },
  {
    name: 'Pakistan Children’s Heart Foundation',
    url: 'https://pchf.org.pk/',
    what: 'Built platform features.',
    about: 'Nonprofit focused on treating congenital heart disease in children.',
  },
  {
    name: 'PAK CR',
    url: 'https://www.pakcr.org/',
    what: 'Helped build the poverty relief management platform.',
    about: 'Poverty relief organization.',
  },
];

export const impactSummary =
  'Mission-driven engineering across four countries and three continents, spanning paid and volunteer work.';

import type { Client } from './types';

export const clients: Client[] = [
  { id: 'nhcc', name: 'Saudi MoH · NHCC', qualifier: 'via Ascend, GE Healthcare partner', url: 'https://ascend.com.sa/projects/national-health-command-center/', caseStudySlug: 'nhcc-apm' },
  { id: 'eutelsat', name: 'Eutelsat', qualifier: "world's first GEO-LEO operator", url: 'https://www.eutelsat.com', caseStudySlug: 'eutelsat-ops-dashboard' },
  { id: 'avelios', name: 'Avelios Medical', qualifier: 'SAP-recommended successor to IS-H', url: 'https://www.avelios.com/en', caseStudySlug: 'avelios' },
  { id: 'isn', name: 'Indigenous Sentinels Network', qualifier: 'Tribally-governed, NOAA-partnered', url: 'https://www.sentinelsnetwork.com', caseStudySlug: 'isn' },
  { id: 'vfairs', name: 'vFairs', qualifier: 'Gartner Magic Quadrant Leader', url: 'https://www.vfairs.com', caseStudySlug: 'vfairs' },
  { id: 'mortgage-automator', name: 'Mortgage Automator', qualifier: 'BVP Forge / Bessemer', url: 'https://mortgageautomator.com', caseStudySlug: 'mortgage-automator' },
];

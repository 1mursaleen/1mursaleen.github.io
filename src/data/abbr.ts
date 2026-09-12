/** Abbreviations used across the site, with full forms. First use per page is
 *  expanded to "Full form (ABBR)"; later uses are wrapped in <abbr title>. */
export const ABBR: Record<string, string> = {
  NHCC: 'National Health Command Center',
  'GEO-LEO': 'geostationary / low-Earth orbit',
  GEO: 'geostationary orbit',
  LEO: 'low-Earth orbit',
  IoT: 'Internet of Things',
  DVB: 'Digital Video Broadcasting',
  'MPEG-TS': 'MPEG transport stream',
  IP: 'Internet Protocol',
  PRD: 'product requirement document',
  'CI/CD': 'continuous integration / continuous delivery',
  CI: 'continuous integration',
  UAT: 'user acceptance testing',
  SDLC: 'software development lifecycle',
  LOS: 'loan origination system',
  HIS: 'hospital information system',
  BI: 'business intelligence',
  APM: 'asset performance management',
  SLA: 'service-level agreement',
  'AML/CFT': 'anti-money-laundering / counter-terrorist-financing',
  NOAA: 'U.S. National Oceanic and Atmospheric Administration',
  SDG: 'Sustainable Development Goal',
  GE: 'General Electric / GE HealthCare',
  MoH: 'Ministry of Health',
  QA: 'quality assurance',
  SSR: 'server-side rendering',
  SSG: 'static-site generation',
  RCT: 'randomized controlled trial',
  OWASP: 'Open Worldwide Application Security Project',
  'IS-H': "SAP's legacy hospital information system",
};

/** Longest keys first so "GEO-LEO" wins over "GEO", "CI/CD" over "CI". */
export const ABBR_KEYS = Object.keys(ABBR).sort((a, b) => b.length - a.length);

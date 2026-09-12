import type { Evidence } from './types';

export const evidence: Evidence[] = [
  { id: 'peng', source: 'GitHub Copilot RCT · Peng et al., 2023', claim: '55.8% faster task completion with AI assistance.', kind: 'support', ref: 'Peng et al. 2023' },
  { id: 'cui', source: 'Microsoft / Accenture field RCTs · Cui et al.', claim: '+12.9 to 21.8% pull requests per week at Microsoft; +7.5 to 8.7% at Accenture.', kind: 'support', ref: 'Cui et al.' },
  { id: 'enterprise', source: 'Enterprise longitudinal study · arXiv 2509.19708', claim: '31.8% overall efficiency gain. AI-generated code scaled to ~40% of production code by August 2025 with no rise in revert or bugfix rates.', kind: 'support', ref: 'arXiv 2509.19708' },
  { id: 'bain', source: 'Bain Technology Report 2024/25', claim: 'Average gains of 10 to 15%. 30%+ only for organizations taking a comprehensive approach. The system, not the tool, unlocks the upper band.', kind: 'support', ref: 'Bain 2024/25' },
  { id: 'mckinsey', source: 'McKinsey · 4,500 developers', claim: 'Roughly 46% time cut on routine tasks, under 10% on high-complexity work. The argument for orchestration plus validation.', kind: 'support', ref: 'McKinsey' },
  { id: 'metr', source: 'METR RCT · arXiv 2507.09089', claim: 'Experienced developers were 19% slower with AI on familiar codebases.', kind: 'counterweight', ref: 'arXiv 2507.09089' },
  { id: 'veracode', source: 'Veracode 2025', claim: '45% of GenAI code samples contained OWASP Top 10 vulnerabilities.', kind: 'counterweight', ref: 'Veracode 2025' },
];

export const evidenceAnswer =
  'The counterweights are exactly why the system exists. PRDs as contracts, reviewer agents, and CI-enforced AI test suites are the countermeasures. Knowing the failure modes is the credential.';

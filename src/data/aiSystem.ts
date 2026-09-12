import type { Principle } from './types';

export const aiThesis =
  'I don’t “use AI tools.” I run a development operating model built on them.';

export const principles: Principle[] = [
  {
    n: '01',
    title: 'PRD-first',
    body: 'AI-drafted, human-reviewed, detailed product requirement documents drive every build. Specs are the contract between me, the client, and the agents.',
  },
  {
    n: '02',
    title: 'Orchestrator pattern',
    body: 'A coordinating AI session spawns and manages sub-sessions with distinct roles: builders implementing features in parallel, reviewers validating builder output, testers. The orchestrator also manages the roadmap.',
  },
  {
    n: '03',
    title: 'File-based durable state',
    body: 'Context, decisions and the roadmap live in versioned files, not model memory. Compounding engineering that survives any single session and accumulates institutional knowledge across weeks of work. Sessions are disposable; the state is not.',
  },
  {
    n: '04',
    title: 'Validated output',
    body: 'AI-written unit tests and Playwright end-to-end tests maintain near-total, CI-enforced coverage. Velocity without quality drift.',
  },
  {
    n: '05',
    title: 'Full-lifecycle coverage',
    body: 'The pipeline runs the entire SDLC agentically: PRDs → AI development → AI Playwright testing → AI CI/CD → UAT → final delivery. Practiced daily for more than a year at Tanbits.',
  },
  {
    n: '06',
    title: 'Throughput',
    body: 'Scores of merged PRs per week, sustained, across accounts.',
  },
  {
    n: '07',
    title: 'Two proofs',
    body: 'Mortgage Automator: a roughly one-year roadmap shipped in a few months (speed). Primexis & Groupe Aplitec: full-lifecycle agentic delivery of regulated financial automation with a five-engineer team (completeness and compliance).',
  },
];

export const toolchain = [
  'Claude Code',
  'ChatGPT Codex',
  'Cursor',
  'GitHub Copilot',
  'DevinAI',
  'LangChain',
  'n8n',
  'ZapierAI',
  'Replit',
  'Lovable',
  'DeepWiki',
];

/** Node graph used by the animated orchestrator diagram. */
export const orchestratorGraph = {
  nodes: [
    { id: 'prd', label: 'PRD', sub: 'human-reviewed spec', x: 60, y: 160 },
    { id: 'orch', label: 'Orchestrator', sub: 'roadmap · spawns roles', x: 300, y: 160 },
    { id: 'b1', label: 'Builder', sub: 'feature A', x: 560, y: 60 },
    { id: 'b2', label: 'Builder', sub: 'feature B', x: 560, y: 160 },
    { id: 'b3', label: 'Builder', sub: 'feature C', x: 560, y: 260 },
    { id: 'rev', label: 'Reviewer', sub: 'validates output', x: 800, y: 110 },
    { id: 'test', label: 'Tester', sub: 'unit + Playwright', x: 800, y: 210 },
    { id: 'ci', label: 'CI', sub: 'coverage enforced', x: 1020, y: 160 },
    { id: 'merge', label: 'Merge', sub: 'scores of PRs / week', x: 1220, y: 160 },
    { id: 'files', label: 'Durable state', sub: 'versioned files', x: 640, y: 380 },
  ],
  edges: [
    ['prd', 'orch'],
    ['orch', 'b1'],
    ['orch', 'b2'],
    ['orch', 'b3'],
    ['b1', 'rev'],
    ['b2', 'rev'],
    ['b3', 'rev'],
    ['b1', 'test'],
    ['b2', 'test'],
    ['b3', 'test'],
    ['rev', 'ci'],
    ['test', 'ci'],
    ['ci', 'merge'],
    ['orch', 'files'],
    ['merge', 'files'],
    ['files', 'orch'],
  ] as [string, string][],
  width: 1300,
  height: 440,
};

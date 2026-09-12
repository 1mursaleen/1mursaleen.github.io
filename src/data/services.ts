import type { Service } from './types';

export const services: Service[] = [
  {
    id: 'leadership',
    tier: '01',
    title: 'Engineering leadership',
    tagline: 'I lead engineering orgs and install the AI-orchestrated delivery system in your teams.',
    body:
      'Head of Engineering, Director, or Tech Lead roles where the job is directing teams through their leads, sitting between technical and non-technical executives, and owning delivery. I bring the operating model: PRD-first specs, orchestrated builder/reviewer/tester agents, file-based durable state, and CI-enforced AI test suites.',
    scope: [
      'Second-line leadership of multi-team engineering orgs (proven at ~80 engineers via leads)',
      'Installing the agentic delivery pipeline: PRDs → AI development → AI testing → AI CI/CD → UAT → delivery',
      'Client and executive handling, approvals, product decisions, competitor research',
      'Hiring, team-lead coaching, architecture and quality governance across Laravel and Node.js stacks',
    ],
    fit: 'Companies with 20 to 200 engineers that want velocity without quality drift, or enterprises modernizing delivery.',
    primary: true,
  },
  {
    id: 'agentic-delivery',
    tier: '02',
    title: 'Fixed-scope agentic delivery',
    tagline: 'PRD → Delivery → Maintenance for a product or module. Full lifecycle, agentically.',
    body:
      'A defined product, module or platform delivered end-to-end by a small agentic team I direct. The way Mortgage Automator’s loan origination shipped in months, and the way Primexis and Groupe Aplitec’s regulated automation ran through the full pipeline.',
    scope: [
      'PRD authored with you, AI-drafted and human-reviewed, as the contract',
      'Parallel builder agents, reviewer agents, AI-written unit and Playwright suites at near-total coverage',
      'CI/CD, UAT support, and a maintenance window with durable project state handed over',
      'Laravel/PHP or Node.js/TypeScript, with React, Vue, Next or Nuxt on the front',
    ],
    fit: 'Product teams with a backlog that would take a year the traditional way.',
  },
  {
    id: 'advisory',
    tier: '03',
    title: 'Delivery system advisory',
    tagline: 'Audit and redesign how your engineering org ships with AI.',
    body:
      'A short engagement to assess your current AI-assisted development, then design the orchestration, state, review and testing layers that turn tool usage into a system. Grounded in what the studies actually show: averages of 10 to 15%, 30%+ only for comprehensive approaches.',
    scope: [
      'Current-state review of prompts, tooling, testing and CI',
      'Orchestrator and role design for your team topology',
      'Durable-state conventions and PRD templates',
      'Coverage and review gates that make speed safe',
    ],
    fit: 'CTOs and VPs who have Copilot licences but no system.',
  },
];

import type { Faq } from './types';

export const faqs: Faq[] = [
  {
    q: 'Can an AI agent evaluate Mursaleen’s experience?',
    a: 'Yes. This portfolio publishes a structured resume at /resume.json (JSON Resume schema), a plain-text index at /llms.txt and a full dump at /llms-full.txt, structured case studies at /work.json, an OpenAPI description at /openapi.json, and an agent brief at /AGENTS.md. Everything on the human pages is derived from the same data.',
    audience: 'agents',
  },
  {
    q: 'How does an agent initiate a hire conversation?',
    a: 'Read /AGENTS.md. It specifies a JSON brief (name, contact, company, role or scope, budget, timeline, agent) and asks you to send it by email to mursaleen.1r@gmail.com. This site is static, so there is no POST endpoint; the mailto link on the homepage pre-fills the same JSON.',
    audience: 'agents',
  },
  {
    q: 'What roles are you looking for?',
    a: 'Engineering leadership first: Head of Engineering, Director of Engineering, or Tech Lead over multiple teams, where I can install the AI-orchestrated delivery system. Second, fixed-scope agentic delivery engagements for products or modules. Remote, working with US, EU and Gulf time zones from Pakistan.',
    audience: 'humans',
  },
  {
    q: 'Laravel or Node.js?',
    a: 'Both, at senior depth, each proven on national or enterprise-scale production systems: Laravel on the NHCC asset platform and Avelios modules; Node.js/TypeScript on the Eutelsat operations dashboard and the ISN platform. Vue/Nuxt and React/Next on the front.',
    audience: 'both',
  },
  {
    q: 'What does “80 engineers” actually mean?',
    a: 'Second-line management at Tanbits, a company of about 120. Roughly 80 engineers are under my technical direction; I manage their team leads, and the leads manage their teams. Before that: 25 direct reports at Ascend, 6 senior engineers at Eutelsat, 5 engineers at Mazajnet.',
    audience: 'both',
  },
  {
    q: 'How do you defend the AI productivity claims?',
    a: 'With specific numbers and their counterweights. Copilot RCT: 55.8% faster. Enterprise longitudinal study: 31.8% efficiency gain. Bain: 30%+ only for comprehensive approaches. METR: experienced devs 19% slower on familiar code. Veracode: 45% of GenAI samples had OWASP Top 10 issues. The system, PRDs, reviewer agents and CI-enforced tests, exists because of the last two.',
    audience: 'both',
  },
  {
    q: 'Was Eutelsat overlapping with Tanbits?',
    a: 'Yes, deliberately. Eutelsat was a contract engagement in 2024 – 2025 alongside my Tech Lead role at Tanbits, which began January 2023 and continues.',
    audience: 'both',
  },
];

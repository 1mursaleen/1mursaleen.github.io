import type { StackColumn } from './types';

export const stackColumns: StackColumn[] = [
  {
    id: 'laravel',
    title: 'PHP / Laravel',
    provenOn: ['NHCC APM (Enoviimax)', 'Avelios modules', 'vFairs features', 'University EdTech platforms', 'Primexis & Aplitec automation'],
    backend: ['Laravel', 'Octane / FrankenPHP', 'Livewire', 'Inertia'],
    frontend: ['Vue', 'Nuxt SSR'],
    data: ['MySQL', 'PostgreSQL', 'Redis'],
    languages: ['PHP', 'JavaScript / TypeScript', 'HTML5', 'CSS3'],
  },
  {
    id: 'node',
    title: 'Node.js / TypeScript',
    provenOn: ['Eutelsat operations dashboard', 'ISN platform and apps', 'Mortgage Automator', 'Real-time systems'],
    backend: ['NestJS', 'Express', 'Node.js'],
    frontend: ['React', 'Next.js'],
    data: ['MongoDB', 'PostgreSQL', 'Redis'],
    languages: ['TypeScript', 'JavaScript', 'Python', 'C (collaboration at Eutelsat)'],
  },
];

export const platformLayer = {
  cloud: ['AWS EC2', 'S3', 'Lambda', 'SES', 'SNS', 'SQS', 'Serverless architecture'],
  integration: ['REST APIs', 'Webhooks', 'WebSockets', 'GraphQL', 'IoT / device integration'],
  payments: ['Stripe', 'Venmo', 'PayPal', 'Apple Pay'],
  delivery: ['CI/CD', 'Git · GitHub · GitLab', 'Agile', 'Jira', 'Confluence', 'Asana'],
  frontend: ['React', 'Vue', 'Next', 'Nuxt', 'Tailwind', 'Bootstrap', 'MUI'],
};

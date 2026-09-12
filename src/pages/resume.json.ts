import type { APIRoute } from 'astro';
import { toJsonResume } from '../lib/resume';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(toJsonResume(), null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { caseStudySlugs } from './data/caseStudies';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/work' }),
  schema: z.object({
    slug: z.string().refine((s) => caseStudySlugs.includes(s), {
      message: `slug must be one of: ${caseStudySlugs.join(', ')}`,
    }),
    chapterTitles: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, work };

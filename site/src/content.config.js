import {glob} from 'astro/loaders';
import {z} from 'astro/zod';
import {defineCollection} from 'astro:content';

const examples = defineCollection({
  loader: glob({pattern: '**/[^_]*.{md,mdx}', base: './src/content/examples'}),
  schema: z.object({
    level: z.number(),
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = {
  examples,
};

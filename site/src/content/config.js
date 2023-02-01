/**
 * Docs: https://docs.astro.build/en/guides/content-collections/#defining-a-collection-schema
 *
 * This file let's us define a schema for frontmatter data in an item
 * from one of the collections.
 *
 * Astro is currently warning about an unsupported content type when finding this file.
 * See https://github.com/withastro/astro/issues/6179
 */

import {defineCollection, z} from 'astro:content';

const examples = defineCollection({
  schema: z.object({
    level: z.number(),
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = {
  examples,
};

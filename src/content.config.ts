import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date(),
    cover: z.string().optional(),
    coverWidth: z.number().optional(),
    coverHeight: z.number().optional(),
    videoUrl: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

const imageItem = z.object({
  url: z.string(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const galleries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/galleries' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date(),
    cover: z.string(),
    coverWidth: z.number().optional(),
    coverHeight: z.number().optional(),
    videoUrl: z.string().optional(),
    images: z.union([z.string(), z.array(z.union([z.string(), imageItem]))]).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles, pages, galleries };
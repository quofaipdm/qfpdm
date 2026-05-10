import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const articles = defineCollection({
  type: 'content',
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
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

const galleries = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date(),
    cover: z.string(),
    coverWidth: z.number().optional(),
    coverHeight: z.number().optional(),
    videoUrl: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles, pages, galleries };
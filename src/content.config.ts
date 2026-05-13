import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { decodeEntities } from '@utils/entities';

const str = () => z.string().transform(decodeEntities);
const strOpt = () => z.string().optional().transform(s => s === undefined ? undefined : decodeEntities(s));

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: str(),
    description: strOpt(),
    date: z.date(),
    category: z.enum(['news', 'birbizis', 'archives']).default('news'),
    cover: strOpt(),
    coverWidth: z.number().optional(),
    coverHeight: z.number().optional(),
    videoUrl: strOpt(),
    galleryRef: z.union([z.string(), z.array(z.string())])
      .optional()
      .transform(v => v === undefined
        ? undefined
        : (Array.isArray(v) ? v : [v])
            .flatMap(s => s.split('\n').map(t => t.trim()).filter(Boolean))
            .map(s => decodeEntities(s))),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: str(),
    description: strOpt(),
    galleryRef: z.union([z.string(), z.array(z.string())])
      .optional()
      .transform(v => v === undefined
        ? undefined
        : (Array.isArray(v) ? v : [v])
            .flatMap(s => s.split('\n').map(t => t.trim()).filter(Boolean))
            .map(s => decodeEntities(s))),
  }),
});

const imageItem = z.object({
  url: z.string(),
  alt: strOpt(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const galleries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/galleries' }),
  schema: z.object({
    title: str(),
    description: strOpt(),
    date: z.date(),
    cover: z.string(),
    coverWidth: z.number().optional(),
    coverHeight: z.number().optional(),
    videoUrl: strOpt(),
    images: z.union([z.string(), z.array(z.union([z.string(), imageItem]))]).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles, pages, galleries };
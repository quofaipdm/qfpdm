import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import rehypeImageToolkit from 'rehype-image-toolkit';
import rehypeImageGrid from './src/utils/rehype-image-grid';
import rehypeImageSrcset from './src/utils/rehype-image-srcset';
import rehypeHeadingLevel from './src/utils/rehype-heading-level';

export default defineConfig({
  site: 'https://quofai.org',

  output: 'static',

   image: {
    // Service local : réplique de @unpic/astro (sharp) + stringification de
    // l'objet style retourné par @unpic/core (sinon Astro sérialise en
    // style="[object Object]"). Voir src/utils/unpic-image-service.ts.
    service: {
      entrypoint: './src/utils/unpic-image-service.ts',
      config: {
        layout: 'constrained',
      },
    },
    domains: ['media.quofai.org'],
  },

  markdown: {
    rehypePlugins: [rehypeImageToolkit, rehypeImageGrid, rehypeImageSrcset, rehypeHeadingLevel],
  },
  // Pas d'adaptateur @astrojs/cloudflare : site 100% statique.
  // Cloudflare Pages sert dist/ directement.

  integrations: [
    sitemap(),
    icon(),
  ],

  build: {
    inlineStylesheets: 'auto',
  },

  vite: {
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        targets: {
          chrome:  80 << 16,
          firefox: 78 << 16,
          safari:  13 << 16,
          edge:    80 << 16,
        },
      },
    },
    build: {
      cssMinify: 'lightningcss',
    },
  },
});

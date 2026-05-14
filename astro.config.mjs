import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import imagekit from '@imagekit/astro/integration';
import icon from 'astro-icon';
import rehypeImageGrid from './src/utils/rehype-image-grid';

export default defineConfig({
  site: 'https://quofai.org',

  output: 'static',

  markdown: {
    rehypePlugins: [rehypeImageGrid],
  },
  // Pas d'adaptateur @astrojs/cloudflare : site 100% statique.
  // Cloudflare Pages sert dist/ directement.

  integrations: [
    sitemap(),
    imagekit({
      urlEndpoint: 'https://ik.imagekit.io/qfpdm',
    }),
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

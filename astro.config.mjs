import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import rehypeImageToolkit from 'rehype-image-toolkit';
import rehypeImageGrid from './src/utils/rehype-image-grid';
import rehypeHeadingLevel from './src/utils/rehype-heading-level';
import { imageService } from '@unpic/astro/service';

export default defineConfig({
  site: 'https://quofai.org',

  output: 'static',

   image: {
    // Unpic détecte automatiquement les CDN depuis les URLs.
    // Pour les URLs sur media.votredomaine.fr, il utilise le provider
    // cloudflare qui génère les URLs /cdn-cgi/image/... (Image Resizing).
    // Gratuit jusqu'à 5 000 transformations uniques/mois.
    service: imageService({
      layout: 'constrained',
    }),
    domains: ['media.quofai.org'],
  },

  markdown: {
    rehypePlugins: [rehypeImageToolkit, rehypeImageGrid, rehypeHeadingLevel],
  },
  // Pas d'adaptateur @astrojs/cloudflare : site 100% statique.
  // Cloudflare Pages sert dist/ directement.

  integrations: [
    sitemap(),
    // imagekit({
    //   urlEndpoint: 'https://ik.imagekit.io/qfpdm',
    // }),
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

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://qfpdm.pages.dev', // ← mettre à jour avec le domaine final

  output: 'static',
  // Pas d'adaptateur @astrojs/cloudflare : site 100% statique.
  // Cloudflare Pages sert dist/ directement.

  integrations: [sitemap()],

  image: {
    // Autorise ImageKit à être utilisé avec <Image> de astro:assets.
    // Sans cette config, les images distantes ne sont pas optimisées
    // mais restent fonctionnelles (pas de srcset automatique).
    remotePatterns: [{
      protocol: 'https',
      hostname: '**.imagekit.io',
    }],
  },

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

/**
 * Nuxt configuration for Ipsumify.
 *
 * Uses ipsumify.config as the single source of truth for site metadata.
 * Generates a static site suitable for Netlify deployment.
 *
 * @see https://nuxt.com/docs/api/configuration/nuxt-config
 * @module nuxt.config
 */
import config from './ipsumify.config'

/** @type {import('nuxt/schema').NuxtConfig} */
export default defineNuxtConfig({
  compatibilityDate: '2026-02-02',
  devtools: { enabled: false },

  modules: ['@nuxt/ui', '@nuxtjs/seo', '@nuxt/eslint'],

  css: ['~/assets/css/main.css'],

  // Site configuration for SEO
  site: {
    url: config.url,
    name: config.name,
    description: config.description,
    defaultLocale: config.defaultLocale
  },

  // Color mode configuration
  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },

  // SSR disabled: reka-ui (used by Nuxt UI v4) crashes during SSR rendering
  // (ConfigProvider.js null ref in renderSlot). Re-enable when reka-ui fixes SSR support.
  ssr: false,
  nitro: {
    preset: 'netlify'
  },

  // Robots configuration
  robots: {
    groups: [
      {
        userAgent: '*',
        allow: '/'
      }
    ]
  },

  // Sitemap configuration
  sitemap: {
    autoLastmod: true,
    xslColumns: [
      { label: 'URL', width: '65%' },
      { label: 'Last Modified', width: '35%' }
    ]
  },

  // Route rules for prerendering
  routeRules: {
    '/': { prerender: true }
  },

  // OG Image generation disabled — we define static OG/Twitter tags in app.head
  ogImage: {
    enabled: false
  },

  app: {
    head: {
      htmlAttrs: {
        lang: config.defaultLocale
      },
      title: config.title,
      meta: [
        { name: 'description', content: config.shortDescription },
        { name: 'theme-color', content: config.primaryColor },
        { name: 'msapplication-TileColor', content: config.tileColor },
        { property: 'og:title', content: config.title },
        { property: 'og:description', content: config.shortDescription },
        { property: 'og:image', content: config.ogImageUrl },
        { property: 'og:url', content: config.url },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: config.title },
        { name: 'twitter:description', content: config.shortDescription },
        { name: 'twitter:image', content: config.ogImageUrl }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: config.faviconPath },
        { rel: 'canonical', href: config.url }
      ]
    }
  }
})

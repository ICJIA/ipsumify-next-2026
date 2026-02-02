// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-02-02',
  devtools: { enabled: false },

  modules: ['@nuxt/ui', '@nuxtjs/seo'],

  css: ['~/assets/css/main.css'],

  // Site configuration for SEO
  site: {
    url: 'https://ipsumify.netlify.app',
    name: 'Ipsumify',
    description: 'Generate beautiful lorem ipsum placeholder text with markdown support. Built for writers and designers who need realistic placeholder content.',
    defaultLocale: 'en'
  },

  // Color mode configuration
  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },

  // Static site generation
  ssr: true,
  nitro: {
    preset: 'static'
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

  // OG Image configuration
  ogImage: {
    enabled: false // Disable for this simple app
  },

  app: {
    head: {
      title: 'Ipsumify - Lorem Ipsum Generator',
      meta: [
        { name: 'description', content: 'Generate beautiful lorem ipsum placeholder text with markdown support' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' }
      ]
    }
  }
})

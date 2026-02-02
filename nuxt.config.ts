// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxt/ui'],

  css: ['~/assets/css/main.css'],

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

  // Nuxt 4 compatibility
  future: {
    compatibilityVersion: 4
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

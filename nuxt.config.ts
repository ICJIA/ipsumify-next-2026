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
import { themes } from './data/themes'

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
    preset: 'netlify',
    // Write technical-details.html, not technical-details/index.html. Netlify
    // answers /technical-details with a redirect to /technical-details/ for a
    // folder, which made the page's canonical URL one that redirects.
    prerender: {
      autoSubfolderIndex: false
    },
    hooks: {
      // With ssr: false every prerendered page is the same shell, with the
      // head from app.head below: the home page's title, description and
      // canonical. A crawler that does not run JavaScript would read the
      // technical details page as a copy of the home page, so its shell gets
      // its own. (In the browser, the page's useSeoMeta does the same job.)
      'prerender:generate'(route) {
        if (route.route !== config.technicalDetailsPath || !route.contents) return
        const swaps: [string, string][] = [
          [`<title>${config.title}</title>`, `<title>${config.technicalDetailsTitle}</title>`],
          [`rel="canonical" href="${config.url}"`, `rel="canonical" href="${config.technicalDetailsUrl}"`],
          [`property="og:url" content="${config.url}"`, `property="og:url" content="${config.technicalDetailsUrl}"`],
          [`property="og:title" content="${config.title}"`, `property="og:title" content="${config.technicalDetailsTitle}"`],
          [`name="twitter:title" content="${config.title}"`, `name="twitter:title" content="${config.technicalDetailsTitle}"`],
          [`name="description" content="${config.shortDescription}"`, `name="description" content="${config.technicalDetailsDescription}"`],
          [`property="og:description" content="${config.shortDescription}"`, `property="og:description" content="${config.technicalDetailsDescription}"`],
          [`name="twitter:description" content="${config.shortDescription}"`, `name="twitter:description" content="${config.technicalDetailsDescription}"`]
        ]
        for (const [from, to] of swaps) {
          if (!route.contents.includes(from)) {
            throw new Error(`[head] "${from}" not found in the prerendered ${route.route}; update the swaps in nuxt.config.ts`)
          }
          route.contents = route.contents.replace(from, to)
        }
      }
    }
  },

  // Icons are compiled into the client bundle and never fetched. `scan` finds
  // the names written in templates; the theme icons are chosen at runtime from
  // data/themes.ts, which the scan does not read, so they are listed. With
  // `provider: 'none'` a name missing from the bundle renders nothing rather
  // than calling api.iconify.design — add new theme icons here.
  icon: {
    provider: 'none',
    clientBundle: {
      scan: true,
      icons: themes.map(t => t.icon.replace(/^i-([a-z0-9]+(?:-icons)?)-/, '$1:'))
    }
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
    '/': { prerender: true },
    '/technical-details': { prerender: true }
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
        { name: 'author', content: config.author },
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
      ],
      script: [
        {
          // WebApplication structured data for search engines and AI systems.
          // Defined here (app.head) so it lands in the prerendered HTML despite ssr: false.
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: config.name,
            url: config.url,
            description: config.shortDescription,
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any (web browser)',
            browserRequirements: 'Requires JavaScript',
            softwareVersion: config.version,
            image: config.ogImageUrl,
            inLanguage: config.defaultLocale,
            isAccessibleForFree: true,
            datePublished: config.datePublished,
            dateModified: config.dateModified,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD'
            },
            author: {
              '@type': 'Organization',
              name: config.author,
              url: config.github
            },
            publisher: {
              '@type': 'Organization',
              name: config.author,
              url: config.github
            },
            featureList: [
              'Markdown-ready output: headers, code blocks, blockquotes, lists, and links',
              'Multiple themes: Lorem Ipsum, Dog, Cat, Baked, and BBQ',
              'Customizable block count, capitalization, and no-wrap mode',
              'One-click copy to clipboard or download as a Markdown file',
              'Shareable URLs that encode your exact settings',
              'Free public REST API with markdown, JSON, text, and HTML output',
              'Command line and npm package: npx ipsumify'
            ]
          })
        }
      ]
    }
  }
})

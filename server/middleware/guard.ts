/**
 * Runs before everything the Netlify Function serves.
 *
 * The site is two prerendered pages plus an API. Netlify serves the page and
 * their assets as static files, with the headers from netlify.toml and
 * dist/_headers. Every other URL reaches this function, and none of those
 * headers come with it, so the function sets its own.
 *
 * It also stops answering unknown URLs with the app's HTML shell. Nuxt's
 * default is to return that shell, with status 200, for any path at all: a
 * page with no Content-Security-Policy that search engines may index under
 * any address someone links to. Unknown paths now get a plain 404.
 *
 * @module server/middleware/guard
 */
import { defineEventHandler, sendRedirect, setResponseHeader, setResponseHeaders, setResponseStatus } from 'h3'

/** Paths the function has a real answer for. */
const SERVED = new Set(['/', '/technical-details', '/api/generate', '/robots.txt', '/sitemap.xml'])
/** Build-time and framework paths (the prerenderer, the sitemap stylesheet). */
const SERVED_PREFIXES = ['/_nuxt/', '/__nuxt', '/__sitemap__/', '/_fonts/', '/_ipx/']

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  })

  const path = event.path.split('?')[0] ?? '/'
  // One address per page: the same path with a trailing slash goes to it
  if (path.length > 1 && path.endsWith('/') && SERVED.has(path.slice(0, -1))) {
    return sendRedirect(event, path.slice(0, -1), 301)
  }
  if (SERVED.has(path) || SERVED_PREFIXES.some(prefix => path.startsWith(prefix))) {
    return
  }

  setResponseStatus(event, 404)
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Content-Security-Policy', 'default-src \'none\'; frame-ancestors \'none\'')
  setResponseHeader(event, 'X-Robots-Tag', 'noindex')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300')
  return 'Not found. Ipsumify is at https://ipsumify.com/ and its API at https://ipsumify.com/api/generate\n'
})

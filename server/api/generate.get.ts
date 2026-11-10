/**
 * GET /api/generate - Lorem ipsum text generation API.
 *
 * Returns generated text using the same engine as the web UI.
 * All parameters are optional — defaults match the web app.
 *
 * Query params:
 *   theme   - Theme ID (lorem, dog, cat, baked, bbq). Default: lorem
 *   blocks  - Number of blocks, 1-20. Default: 5
 *   seed    - RNG seed, a whole number from 0 to 2147483647. Default: 42
 *   md      - Comma-separated markdown elements: headers (or headings),code,quotes,lists,links
 *   lower   - Set to "1" to disable capitalization
 *   nowrap  - Set to "1" for single-line output
 *   format  - Response format: markdown (default), json, text, html
 *
 * @module server/api/generate
 */
import { defineEventHandler, setResponseHeader, setResponseStatus } from 'h3'
import { themes } from '../../data/themes'
import { generateText, generateBlocks, markdownToPlainText, DEFAULT_OPTIONS } from '../../utils/generate'
import type { GenerateOptions } from '../../utils/generate'
import config from '../../ipsumify.config'
import { parseApiQuery, API_PARAMS, ApiQueryError } from '../../utils/apiQuery'
import { renderHtml } from '../../utils/html'

export default defineEventHandler(async (event) => {
  // No CORS headers — blocks cross-origin browser fetch, curl still works
  // netlify.toml's headers reach only the static pages; the API sets its own.
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-Frame-Options', 'DENY')
  setResponseHeader(event, 'Referrer-Policy', 'no-referrer')
  setResponseHeader(event, 'Content-Security-Policy', 'default-src \'none\'; frame-ancestors \'none\'')
  // Netlify keys its cache on these parameters alone, so an unrelated one
  // cannot force a fresh function run for output that is already cached.
  setResponseHeader(event, 'Netlify-Vary', `query=${API_PARAMS.join('|')}`)

  let query
  try {
    // The raw query string, not h3's decoded one. See utils/apiQuery.ts: what
    // this handler acts on must be exactly what the CDN keys its cache on.
    const queryStart = event.path.indexOf('?')
    query = parseApiQuery(queryStart === -1 ? '' : event.path.slice(queryStart + 1), {
      themeIds: themes.map(t => t.id),
    })
  }
  catch (error) {
    if (!(error instanceof ApiQueryError)) throw error
    // Returned, not thrown: a thrown error goes through Nuxt's error page,
    // which answers browsers with HTML. And never cached: only a well-formed
    // request's answer may be stored against its URL.
    setResponseStatus(event, 400)
    setResponseHeader(event, 'Cache-Control', 'no-store')
    return { error: true, statusCode: 400, message: error.message }
  }

  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

  const themeId = query.theme ?? config.defaultThemeId
  const blocks = query.blocks ?? config.defaultBlocks
  const seed = query.seed ?? config.defaultSeed
  const format = query.format ?? 'markdown'

  const options: GenerateOptions = { ...DEFAULT_OPTIONS }
  if (query.md) {
    options.headers = query.md.includes('headers')
    options.codeSnippets = query.md.includes('code')
    options.blockquotes = query.md.includes('quotes')
    options.lists = query.md.includes('lists')
    options.links = query.md.includes('links')
  }
  if (query.lower) options.capitalize = false
  if (query.nowrap) options.noWrap = true

  const theme = themes.find(t => t.id === themeId)!
  const params = { theme, blocks, seed, options }
  const markdown = generateText(params)

  if (format === 'json') {
    return { theme: themeId, blocks, seed, format, options, output: generateBlocks(params), markdown }
  }
  if (format === 'html') {
    return { theme: themeId, blocks, seed, format, output: renderHtml(params) }
  }
  if (format === 'text') {
    return { theme: themeId, blocks, seed, format, output: markdownToPlainText(markdown) }
  }
  return { theme: themeId, blocks, seed, format, output: markdown }
})

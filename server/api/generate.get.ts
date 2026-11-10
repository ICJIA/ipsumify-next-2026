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
 *   md      - Comma-separated markdown elements: headers,code,quotes,lists,links
 *   lower   - Set to "1" to disable capitalization
 *   nowrap  - Set to "1" for single-line output
 *   format  - Response format: markdown (default), json, text, html
 *
 * @module server/api/generate
 */
import { defineEventHandler, getQuery, createError, setResponseHeader } from 'h3'
import { themes } from '../../data/themes'
import { generateText, generateBlocks, markdownToPlainText, DEFAULT_OPTIONS } from '../../utils/generate'
import { MAX_SEED } from '../../utils/random'
import type { GenerateOptions } from '../../utils/generate'
import config from '../../ipsumify.config'
import { marked } from 'marked'

const VALID_THEME_IDS = new Set(themes.map(t => t.id))
const VALID_FORMATS = new Set(['markdown', 'json', 'text', 'html'])
const MAX_BLOCKS = 20
const MIN_BLOCKS = 1
/** The query parameters that change the response; the CDN keys its cache on these alone. */
const CACHE_KEY_PARAMS = ['theme', 'blocks', 'seed', 'md', 'lower', 'nowrap', 'format']
/** Whole numbers only: no sign, fraction, exponent, hex or empty string. */
const DIGITS = /^\d{1,10}$/

/**
 * Reads one query parameter as a string. A repeated parameter (?md=a&md=b)
 * arrives as an array; its values are joined with commas, which is the form
 * `md` takes anyway and fails validation cleanly for every other parameter.
 */
function param(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  return Array.isArray(value) ? value.join(',') : String(value)
}

export default defineEventHandler(async (event) => {
  // No CORS headers — blocks cross-origin browser fetch, curl still works
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
  // Netlify ignores every other query parameter when caching, so appending
  // ?junk=1 can no longer force a fresh function run for the same output.
  setResponseHeader(event, 'Netlify-Vary', `query=${CACHE_KEY_PARAMS.join('|')}`)
  // netlify.toml's headers reach only the static pages; the API sets its own.
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-Frame-Options', 'DENY')
  setResponseHeader(event, 'Referrer-Policy', 'no-referrer')
  setResponseHeader(event, 'Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'")

  const rawQuery = getQuery(event)
  const query = {
    theme: param(rawQuery.theme),
    blocks: param(rawQuery.blocks),
    seed: param(rawQuery.seed),
    md: param(rawQuery.md),
    lower: param(rawQuery.lower),
    nowrap: param(rawQuery.nowrap),
    format: param(rawQuery.format),
  }

  // Validate theme
  const themeId = query.theme || config.defaultThemeId
  if (!VALID_THEME_IDS.has(themeId)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid theme "${themeId}". Valid themes: ${[...VALID_THEME_IDS].join(', ')}`,
    })
  }

  // Validate blocks
  let blocks: number = config.defaultBlocks
  if (query.blocks !== undefined) {
    const parsed = Number(query.blocks)
    if (!DIGITS.test(query.blocks) || parsed < MIN_BLOCKS || parsed > MAX_BLOCKS) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid blocks "${query.blocks}". Must be an integer between ${MIN_BLOCKS} and ${MAX_BLOCKS}.`,
      })
    }
    blocks = parsed
  }

  // Validate seed
  let seed: number = config.defaultSeed
  if (query.seed !== undefined) {
    const parsed = Number(query.seed)
    if (!DIGITS.test(query.seed) || parsed > MAX_SEED) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid seed "${query.seed}". Must be a whole number between 0 and ${MAX_SEED}.`,
      })
    }
    seed = parsed
  }

  // Validate format
  const format = query.format || 'markdown'
  if (!VALID_FORMATS.has(format)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid format "${format}". Valid formats: ${[...VALID_FORMATS].join(', ')}`,
    })
  }

  // Parse markdown options
  const options: GenerateOptions = { ...DEFAULT_OPTIONS }
  if (query.md) {
    const mdParts = query.md.split(',')
    options.headers = mdParts.includes('headers')
    options.codeSnippets = mdParts.includes('code')
    options.blockquotes = mdParts.includes('quotes')
    options.lists = mdParts.includes('lists')
    options.links = mdParts.includes('links')
  }
  if (query.lower === '1') {
    options.capitalize = false
  }
  if (query.nowrap === '1') {
    options.noWrap = true
  }

  const theme = themes.find(t => t.id === themeId)!
  const params = { theme, blocks, seed, options }

  // Generate based on format
  const markdown = generateText(params)

  if (format === 'json') {
    const blockArray = generateBlocks(params)
    return {
      theme: themeId,
      blocks,
      seed,
      format,
      options,
      output: blockArray,
      markdown,
    }
  }

  if (format === 'html') {
    const html = await marked(markdown)
    return {
      theme: themeId,
      blocks,
      seed,
      format,
      output: html,
    }
  }

  if (format === 'text') {
    const text = markdownToPlainText(markdown)
    return {
      theme: themeId,
      blocks,
      seed,
      format,
      output: text,
    }
  }

  // Default: markdown
  return {
    theme: themeId,
    blocks,
    seed,
    format,
    output: markdown,
  }
})

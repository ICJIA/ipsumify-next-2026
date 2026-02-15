/**
 * GET /api/generate - Lorem ipsum text generation API.
 *
 * Returns generated text using the same engine as the web UI.
 * All parameters are optional — defaults match the web app.
 *
 * Query params:
 *   theme   - Theme ID (lorem, dog, cat, baked, bbq). Default: lorem
 *   blocks  - Number of blocks, 1-20. Default: 5
 *   seed    - RNG seed for deterministic output. Default: 42
 *   md      - Comma-separated markdown elements: headers,code,quotes,lists,links
 *   lower   - Set to "1" to disable capitalization
 *   nowrap  - Set to "1" for single-line output
 *   format  - Response format: markdown (default), json, text, html
 *
 * @module server/api/generate
 */
import { defineEventHandler, getQuery, createError, setResponseHeader } from 'h3'
import { themes } from '../../data/themes'
import { generateText, generateBlocks, DEFAULT_OPTIONS } from '../../utils/generate'
import type { GenerateOptions } from '../../utils/generate'
import config from '../../ipsumify.config'
import { marked } from 'marked'

const VALID_THEME_IDS = new Set(themes.map(t => t.id))
const VALID_FORMATS = new Set(['markdown', 'json', 'text', 'html'])
const MAX_BLOCKS = 20
const MIN_BLOCKS = 1

export default defineEventHandler(async (event) => {
  // No CORS headers — blocks cross-origin browser fetch, curl still works
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

  const query = getQuery(event)

  // Validate theme
  const themeId = (query.theme as string) || config.defaultThemeId
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
    if (!Number.isInteger(parsed) || parsed < MIN_BLOCKS || parsed > MAX_BLOCKS) {
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
    if (!Number.isInteger(parsed)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid seed "${query.seed}". Must be an integer.`,
      })
    }
    seed = parsed
  }

  // Validate format
  const format = (query.format as string) || 'markdown'
  if (!VALID_FORMATS.has(format)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid format "${format}". Valid formats: ${[...VALID_FORMATS].join(', ')}`,
    })
  }

  // Parse markdown options
  const options: GenerateOptions = { ...DEFAULT_OPTIONS }
  if (query.md) {
    const mdParts = (query.md as string).split(',')
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
    // Strip markdown syntax for plain text
    const text = markdown
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^>\s+/gm, '')
      .replace(/^[-*]\s+/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
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

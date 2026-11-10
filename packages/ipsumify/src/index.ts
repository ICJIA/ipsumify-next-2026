/**
 * ipsumify — lorem ipsum generator for Node.
 *
 * The same engine as https://ipsumify.com and its API: the same theme, block
 * count, seed and options give the same text in all three.
 *
 * @module ipsumify
 */
import { themes as themeData } from '../../../data/themes'
import { generateText, generateBlocks, markdownToPlainText } from '../../../utils/generate'
import { renderHtml } from '../../../utils/html'
import { MAX_SEED, SEED_PERIOD } from '../../../utils/random'

export const MIN_BLOCKS = 1
export const MAX_BLOCKS = 20
export const DEFAULT_BLOCKS = 5
export const DEFAULT_THEME = 'lorem'
export { MAX_SEED }

export type Format = 'markdown' | 'text' | 'html'
export const FORMATS: readonly Format[] = Object.freeze(['markdown', 'text', 'html'] as const)

export interface IpsumifyOptions {
  /** Theme id: lorem (default), dog, cat, baked, bbq */
  theme?: string
  /** Number of blocks (paragraphs), 1 to 20. Default 5 */
  blocks?: number
  /** Whole number from 0 to 2147483647. The same seed gives the same text. Random when omitted */
  seed?: number
  /** Add markdown headings */
  headers?: boolean
  /** Add code snippets */
  code?: boolean
  /** Add blockquotes */
  quotes?: boolean
  /** Add bullet lists */
  lists?: boolean
  /** Add links */
  links?: boolean
  /** Lowercase everything */
  lowercase?: boolean
  /** Put everything on one line, with no line breaks */
  noWrap?: boolean
  /** markdown (default), text (markdown syntax stripped), or html */
  format?: Format
}

/** The available themes, as `{ id, label }`. */
export const themes: readonly { id: string, label: string }[] = Object.freeze(
  themeData.map(t => Object.freeze({ id: t.id, label: t.label })),
)

/** A seed chosen at random from every seed that gives distinct text. */
export function randomSeed(): number {
  return Math.floor(Math.random() * SEED_PERIOD)
}

const SWITCHES = ['headers', 'code', 'quotes', 'lists', 'links', 'lowercase', 'noWrap'] as const

function resolve(options: IpsumifyOptions, { checkFormat = true } = {}) {
  if (typeof options !== 'object' || options === null || Array.isArray(options)) {
    throw new TypeError('ipsumify: options must be an object, for example { blocks: 3 }.')
  }
  // 'false' is a truthy string; only real booleans switch anything
  for (const name of SWITCHES) {
    if (options[name] !== undefined && typeof options[name] !== 'boolean') {
      throw new TypeError(`ipsumify: "${name}" must be true or false.`)
    }
  }

  const themeId = options.theme ?? DEFAULT_THEME
  const theme = themeData.find(t => t.id === themeId)
  if (!theme) {
    throw new RangeError(`Invalid theme "${themeId}". Valid themes: ${themeData.map(t => t.id).join(', ')}`)
  }

  const blocks = options.blocks ?? DEFAULT_BLOCKS
  if (!Number.isInteger(blocks) || blocks < MIN_BLOCKS || blocks > MAX_BLOCKS) {
    throw new RangeError(`Invalid blocks "${blocks}". Must be a whole number between ${MIN_BLOCKS} and ${MAX_BLOCKS}.`)
  }

  const seed = options.seed ?? randomSeed()
  if (!Number.isInteger(seed) || seed < 0 || seed > MAX_SEED) {
    throw new RangeError(`Invalid seed "${seed}". Must be a whole number between 0 and ${MAX_SEED}.`)
  }

  const format = options.format ?? 'markdown'
  if (checkFormat && !FORMATS.includes(format)) {
    throw new RangeError(`Invalid format "${format}". Valid formats: ${FORMATS.join(', ')}`)
  }

  return {
    format,
    params: {
      theme,
      blocks,
      seed,
      options: {
        headers: options.headers ?? false,
        codeSnippets: options.code ?? false,
        blockquotes: options.quotes ?? false,
        lists: options.lists ?? false,
        links: options.links ?? false,
        capitalize: !(options.lowercase ?? false),
        noWrap: options.noWrap ?? false,
      },
    },
  }
}

/**
 * Generates placeholder text.
 *
 * @example
 * ipsumify()                                  // five paragraphs of lorem ipsum
 * ipsumify({ blocks: 2, theme: 'dog' })
 * ipsumify({ headers: true, lists: true, seed: 42 })
 * ipsumify({ format: 'html' })
 *
 * @throws {RangeError} For an unknown theme or format, or blocks or seed out of range
 * @throws {TypeError} If options is not an object, or a switch is not a boolean
 */
export function ipsumify(options: IpsumifyOptions = {}): string {
  const { format, params } = resolve(options)
  if (format === 'html') return renderHtml(params)
  const markdown = generateText(params)
  return format === 'text' ? markdownToPlainText(markdown) : markdown
}

/**
 * Generates the body paragraphs as an array, one string per block, without
 * any markdown elements. `format` is ignored.
 *
 * @throws {RangeError} For an unknown theme, or blocks or seed out of range
 * @throws {TypeError} If options is not an object, or a switch is not a boolean
 */
export function paragraphs(options: IpsumifyOptions = {}): string[] {
  return generateBlocks(resolve(options, { checkFormat: false }).params)
}

export default ipsumify

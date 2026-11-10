/**
 * Strict parsing of the API's query string.
 *
 * The API's responses are cached by a CDN that builds its cache key from the
 * raw query string, looking only at the seven parameter names below. Anything
 * the handler understood differently from the CDN was a way to store one
 * request's answer under another request's URL:
 *
 *   - `th%65me=dog` decodes to `theme=dog` for a normal query parser, but to
 *     the CDN it is an unknown name and not part of the key, so the dog text
 *     was cached for the URL without a theme.
 *   - A repeated parameter can be read as its first value by one side and as
 *     all of them by the other.
 *
 * So this parser decodes nothing and guesses nothing. A request is accepted
 * only if every name is literally one of the seven, appears once, and has a
 * value in the plain characters the parameters actually use. Everything else
 * is an error, and errors are never cached. Values are also held to one
 * spelling each (no leading zeros, no unknown or repeated `md` names, `1` or
 * nothing for the switches) so that one output has few URLs, not unlimited.
 *
 * @module utils/apiQuery
 */
import { MAX_SEED } from './random'

/** The parameters that select the response, and the CDN's cache key. */
export const API_PARAMS = ['theme', 'blocks', 'seed', 'md', 'lower', 'nowrap', 'format'] as const
export type ApiParam = typeof API_PARAMS[number]

export const API_FORMATS = ['markdown', 'json', 'text', 'html'] as const
export type ApiFormat = typeof API_FORMATS[number]

/** Markdown element names. `headings` is accepted as another name for `headers`. */
export const MD_ELEMENTS = ['headers', 'code', 'quotes', 'lists', 'links'] as const
export type MdElement = typeof MD_ELEMENTS[number]
const MD_ALIASES: ReadonlyMap<string, MdElement> = new Map([
  ...MD_ELEMENTS.map(name => [name, name] as const),
  ['headings', 'headers'],
])

export const MIN_BLOCKS = 1
export const MAX_BLOCKS = 20

/** A whole number written one way: no sign, fraction, exponent or leading zero. */
const WHOLE_NUMBER = /^(0|[1-9]\d{0,9})$/
/** The only characters any valid value contains. No `%` or `+`: nothing to decode. */
const PLAIN_VALUE = /^[A-Za-z0-9,]*$/

/** A request the API refuses. The message is safe to show the caller. */
export class ApiQueryError extends Error {}

export interface ApiQuery {
  theme?: string
  blocks?: number
  seed?: number
  md?: MdElement[]
  lower?: true
  nowrap?: true
  format?: ApiFormat
}

/** Shortens caller input before it is quoted back in an error message. */
function quote(value: string): string {
  const printable = value.replace(/[^\x20-\x7E]/g, '?')
  return `"${printable.length > 40 ? `${printable.slice(0, 40)}...` : printable}"`
}

/**
 * Parses and validates a raw query string.
 *
 * @param search - The query string exactly as received, with or without its leading "?"
 * @param context - The valid theme ids
 * @returns The parameters that were given, validated and typed
 * @throws {ApiQueryError} For anything other than a well-formed request
 */
export function parseApiQuery(search: string, context: { themeIds: readonly string[] }): ApiQuery {
  const raw = new Map<ApiParam, string>()
  const body = search.startsWith('?') ? search.slice(1) : search

  for (const part of body.split('&')) {
    if (part === '') continue
    const equals = part.indexOf('=')
    const name = equals === -1 ? part : part.slice(0, equals)
    const value = equals === -1 ? '' : part.slice(equals + 1)

    if (!(API_PARAMS as readonly string[]).includes(name)) {
      throw new ApiQueryError(`Unknown parameter ${quote(name)}. Valid parameters: ${API_PARAMS.join(', ')}`)
    }
    if (raw.has(name as ApiParam)) {
      throw new ApiQueryError(`Parameter "${name}" is given more than once.`)
    }
    if (value === '' || !PLAIN_VALUE.test(value)) {
      throw new ApiQueryError(`Invalid ${name} ${quote(value)}. Use plain letters, digits and commas, without encoding.`)
    }
    raw.set(name as ApiParam, value)
  }

  const query: ApiQuery = {}

  const theme = raw.get('theme')
  if (theme !== undefined) {
    if (!context.themeIds.includes(theme)) {
      throw new ApiQueryError(`Invalid theme ${quote(theme)}. Valid themes: ${context.themeIds.join(', ')}`)
    }
    query.theme = theme
  }

  const blocks = raw.get('blocks')
  if (blocks !== undefined) {
    const parsed = Number(blocks)
    if (!WHOLE_NUMBER.test(blocks) || parsed < MIN_BLOCKS || parsed > MAX_BLOCKS) {
      throw new ApiQueryError(`Invalid blocks ${quote(blocks)}. Must be a whole number between ${MIN_BLOCKS} and ${MAX_BLOCKS}.`)
    }
    query.blocks = parsed
  }

  const seed = raw.get('seed')
  if (seed !== undefined) {
    const parsed = Number(seed)
    if (!WHOLE_NUMBER.test(seed) || parsed > MAX_SEED) {
      throw new ApiQueryError(`Invalid seed ${quote(seed)}. Must be a whole number between 0 and ${MAX_SEED}.`)
    }
    query.seed = parsed
  }

  const format = raw.get('format')
  if (format !== undefined) {
    if (!(API_FORMATS as readonly string[]).includes(format)) {
      throw new ApiQueryError(`Invalid format ${quote(format)}. Valid formats: ${API_FORMATS.join(', ')}`)
    }
    query.format = format as ApiFormat
  }

  const md = raw.get('md')
  if (md !== undefined) {
    const elements: MdElement[] = []
    for (const name of md.split(',')) {
      const element = MD_ALIASES.get(name)
      if (!element) {
        throw new ApiQueryError(`Invalid md value ${quote(name)}. Valid values: ${MD_ELEMENTS.join(', ')}`)
      }
      if (elements.includes(element)) {
        throw new ApiQueryError(`md value "${element}" is given more than once.`)
      }
      elements.push(element)
    }
    query.md = elements
  }

  for (const name of ['lower', 'nowrap'] as const) {
    const value = raw.get(name)
    if (value === undefined) continue
    if (value !== '1') {
      throw new ApiQueryError(`Invalid ${name} ${quote(value)}. Use ${name}=1, or leave it out.`)
    }
    query[name] = true
  }

  return query
}

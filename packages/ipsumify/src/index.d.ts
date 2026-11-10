export type Format = 'markdown' | 'text' | 'html'

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

export declare const MIN_BLOCKS: number
export declare const MAX_BLOCKS: number
export declare const DEFAULT_BLOCKS: number
export declare const DEFAULT_THEME: string
export declare const MAX_SEED: number
export declare const FORMATS: readonly Format[]

/** The available themes. */
export declare const themes: readonly { id: string, label: string }[]

/** A seed chosen at random. */
export declare function randomSeed(): number

/**
 * Generates placeholder text.
 * @throws {RangeError} For an unknown theme or format, or blocks or seed out of range
 */
export declare function ipsumify(options?: IpsumifyOptions): string

/**
 * Generates the body paragraphs as an array, one string per block, without markdown elements.
 * @throws {RangeError} For an unknown theme, or blocks or seed out of range
 */
export declare function paragraphs(options?: IpsumifyOptions): string[]

export default ipsumify

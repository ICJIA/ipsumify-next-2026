/**
 * Shared text generation logic used by both the web UI and the API.
 *
 * @module utils/generate
 */
import type { Theme } from '../data/themes'
import { seededRandom, shuffleWithSeed, SEED_OFFSETS } from './random'

/** Options controlling markdown elements and formatting. */
export interface GenerateOptions {
  headers: boolean
  codeSnippets: boolean
  blockquotes: boolean
  lists: boolean
  links: boolean
  capitalize: boolean
  noWrap: boolean
}

/** Full set of parameters for text generation. */
export interface GenerateParams {
  theme: Theme
  blocks: number
  seed: number
  options: GenerateOptions
}

/** Default generate options (no markdown elements, capitalize on, wrap on). */
export const DEFAULT_OPTIONS: GenerateOptions = {
  headers: false,
  codeSnippets: false,
  blockquotes: false,
  lists: false,
  links: false,
  capitalize: true,
  noWrap: false,
}

/**
 * The one generation pass behind both generateText and generateBlocks.
 *
 * Headings draw from the same random sequence that sizes the blocks, so the
 * body blocks can only be known by running the whole pass. A separate loop
 * that replayed just the block sizes returned different blocks from the ones
 * in the text whenever headers were on.
 *
 * @param params - Generation parameters (theme, blocks, seed, options)
 * @returns The full text, and the body text of each block in order
 */
function generate(params: GenerateParams): { text: string, blocks: string[] } {
  const { theme, blocks, seed, options } = params
  const paragraphs = shuffleWithSeed(theme.paragraphs, seed)
  const headings = shuffleWithSeed(theme.headings, seed + SEED_OFFSETS.HEADINGS)
  const listItems = theme.listItems
  const rng = seededRandom(seed + SEED_OFFSETS.BLOCK_SIZES)
  const blockSeparator = options.noWrap ? ' ' : '\n\n'
  const bodyBlocks: string[] = []
  let output = ''
  let paragraphIndex = 0
  let headingIndex = 0
  let currentHeadingLevel = 1
  let blocksUntilNextHeading = 0

  const getNextHeading = (): string => {
    const text = headings[headingIndex % headings.length] ?? 'Section'
    headingIndex++
    return options.capitalize ? text : text.toLowerCase()
  }

  const makeHeading = (level: number, text: string) => {
    const hashes = '#'.repeat(level)
    if (options.noWrap) {
      return `${hashes} ${text} `
    }
    return `${hashes} ${text}\n\n`
  }

  for (let i = 0; i < blocks; i++) {
    const blockSize = rng.nextInt(1, 3)
    let blockContent = ''

    for (let j = 0; j < blockSize; j++) {
      const rawSentence = paragraphs[paragraphIndex % paragraphs.length] ?? ''
      paragraphIndex++
      const sentence = options.capitalize ? rawSentence : rawSentence.toLowerCase()
      blockContent += sentence + ' '
    }

    blockContent = blockContent.trim()
    bodyBlocks.push(blockContent)

    if (options.headers) {
      if (i === 0) {
        output += makeHeading(1, getNextHeading())
        currentHeadingLevel = 2
        blocksUntilNextHeading = rng.nextInt(1, 3)
      } else if (blocksUntilNextHeading <= 0) {
        const decision = rng.nextInt(1, 10)
        if (decision <= 3 && currentHeadingLevel < 4) {
          currentHeadingLevel++
        } else if (decision <= 5 && currentHeadingLevel > 2) {
          currentHeadingLevel--
        } else if (decision <= 7 && currentHeadingLevel > 2) {
          currentHeadingLevel = 2
        }
        output += makeHeading(currentHeadingLevel, getNextHeading())
        blocksUntilNextHeading = rng.nextInt(1, 4)
      } else {
        blocksUntilNextHeading--
      }
    }

    if (options.codeSnippets && i % 3 === 0) {
      if (options.noWrap) {
        output += '`const example = \'code\';` '
      } else {
        output += '```javascript\nconst example = \'code\';\n```\n\n'
      }
    }
    if (options.blockquotes && i % 2 === 1) {
      if (options.noWrap) {
        output += `> ${blockContent.slice(0, 100)}... `
      } else {
        output += `> ${blockContent.slice(0, 100)}...\n\n`
      }
    }
    if (options.lists && i % 3 === 2) {
      if (options.noWrap) {
        const items = listItems
          .map((item) => `• ${options.capitalize ? item : item.toLowerCase()}`)
          .join(' ')
        output += items + ' '
      } else {
        const items = listItems
          .map((item) => `- ${options.capitalize ? item : item.toLowerCase()}`)
          .join('\n')
        output += items + '\n\n'
      }
    }
    if (options.links && i % 4 === 0) {
      const linkText = options.capitalize ? 'Learn more' : 'learn more'
      output += `[${linkText}](https://example.com) `
    }
    output += blockContent + blockSeparator
  }

  if (options.noWrap) {
    output = output.replace(/<br\s*\/?>/gi, ' ')
    output = output.replace(/\n+/g, ' ')
    output = output.replace(/\s+/g, ' ')
    output = output.trim()
  } else if (output.endsWith('\n\n')) {
    output = output.slice(0, -2)
  }

  return { text: output, blocks: bodyBlocks }
}

/**
 * Generates lorem ipsum text with optional markdown elements.
 *
 * Deterministic: same params always produce the same output.
 *
 * @param params - Generation parameters (theme, blocks, seed, options)
 * @returns The generated markdown/text string
 */
export function generateText(params: GenerateParams): string {
  return generate(params).text
}

/**
 * Generates text and returns the body of each block on its own, without
 * headings, code, quotes, lists or links. Every entry appears verbatim in
 * generateText's output for the same params. Used by the JSON API format.
 *
 * @param params - Generation parameters
 * @returns Array of individual text blocks
 */
export function generateBlocks(params: GenerateParams): string[] {
  return generate(params).blocks
}

/**
 * Strips the markdown that generateText writes, leaving plain text.
 *
 * In no-wrap mode everything is on one line, so a heading's hashes, a quote's
 * ">" and a list's bullets sit mid-line; they are matched after any
 * whitespace, not only at the start of a line. Theme text contains none of
 * these markers, so only generated syntax is removed. Code is dropped whole.
 *
 * @param markdown - Text produced by generateText
 * @returns The same text without markdown syntax
 */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/(^|\s)#{1,6}[ \t]+/g, '$1')
    .replace(/(^|\s)>[ \t]+/g, '$1')
    .replace(/(^|\s)[-*•][ \t]+/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

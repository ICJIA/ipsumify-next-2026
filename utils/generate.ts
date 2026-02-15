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
 * Generates lorem ipsum text with optional markdown elements.
 *
 * Deterministic: same params always produce the same output.
 *
 * @param params - Generation parameters (theme, blocks, seed, options)
 * @returns The generated markdown/text string
 */
export function generateText(params: GenerateParams): string {
  const { theme, blocks, seed, options } = params
  const paragraphs = shuffleWithSeed(theme.paragraphs, seed)
  const headings = shuffleWithSeed(theme.headings, seed + SEED_OFFSETS.HEADINGS)
  const listItems = theme.listItems
  const rng = seededRandom(seed + SEED_OFFSETS.BLOCK_SIZES)
  const blockSeparator = options.noWrap ? ' ' : '\n\n'
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

  return output
}

/**
 * Generates text and splits it into individual blocks.
 * Used by the JSON API format.
 *
 * @param params - Generation parameters
 * @returns Array of individual text blocks
 */
export function generateBlocks(params: GenerateParams): string[] {
  const { theme, blocks, seed, options } = params
  const paragraphs = shuffleWithSeed(theme.paragraphs, seed)
  const rng = seededRandom(seed + SEED_OFFSETS.BLOCK_SIZES)
  const result: string[] = []
  let paragraphIndex = 0

  for (let i = 0; i < blocks; i++) {
    const blockSize = rng.nextInt(1, 3)
    let blockContent = ''

    for (let j = 0; j < blockSize; j++) {
      const rawSentence = paragraphs[paragraphIndex % paragraphs.length] ?? ''
      paragraphIndex++
      const sentence = options.capitalize ? rawSentence : rawSentence.toLowerCase()
      blockContent += sentence + ' '
    }

    result.push(blockContent.trim())
  }

  return result
}

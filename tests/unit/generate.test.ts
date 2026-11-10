/**
 * Unit tests for the shared text generation utility.
 *
 * @module tests/unit/generate
 */
import { describe, it, expect } from 'vitest'
import { generateText, generateBlocks, markdownToPlainText, DEFAULT_OPTIONS } from '../../utils/generate'
import type { GenerateParams } from '../../utils/generate'
import type { Theme } from '../../data/themes'

const mockTheme: Theme = {
  id: 'test',
  label: 'Test Theme',
  icon: 'i-lucide-test',
  paragraphs: [
    'The quick brown fox jumps over the lazy dog.',
    'Pack my box with five dozen liquor jugs.',
    'How vexingly quick daft zebras jump.',
  ],
  headings: ['Alpha', 'Beta', 'Gamma'],
  listItems: ['Item one', 'Item two', 'Item three'],
}

function makeParams(overrides?: Partial<GenerateParams>): GenerateParams {
  return {
    theme: mockTheme,
    blocks: 3,
    seed: 42,
    options: { ...DEFAULT_OPTIONS },
    ...overrides,
  }
}

describe('generateText', () => {
  it('returns a non-empty string', () => {
    const result = generateText(makeParams())
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('is deterministic — same params produce same output', () => {
    const a = generateText(makeParams())
    const b = generateText(makeParams())
    expect(a).toBe(b)
  })

  it('produces different output with a different seed', () => {
    const a = generateText(makeParams({ seed: 1 }))
    const b = generateText(makeParams({ seed: 999 }))
    expect(a).not.toBe(b)
  })

  it('respects the blocks count', () => {
    const one = generateText(makeParams({ blocks: 1 }))
    const five = generateText(makeParams({ blocks: 5 }))
    expect(five.length).toBeGreaterThan(one.length)
  })

  it('adds markdown headers when options.headers is true', () => {
    const params = makeParams()
    params.options.headers = true
    const result = generateText(params)
    expect(result).toMatch(/^# /)
  })

  it('adds code snippets when options.codeSnippets is true', () => {
    const params = makeParams()
    params.options.codeSnippets = true
    const result = generateText(params)
    expect(result).toContain('```javascript')
  })

  it('adds blockquotes when options.blockquotes is true', () => {
    const params = makeParams({ blocks: 4 })
    params.options.blockquotes = true
    const result = generateText(params)
    expect(result).toContain('> ')
  })

  it('adds lists when options.lists is true', () => {
    const params = makeParams({ blocks: 5 })
    params.options.lists = true
    const result = generateText(params)
    expect(result).toContain('- Item')
  })

  it('adds links when options.links is true', () => {
    const params = makeParams()
    params.options.links = true
    const result = generateText(params)
    expect(result).toContain('[Learn more](https://example.com)')
  })

  it('lowercases text when capitalize is false', () => {
    const params = makeParams()
    params.options.capitalize = false
    const result = generateText(params)
    expect(result).toBe(result.toLowerCase())
  })

  it('produces single-line output when noWrap is true', () => {
    const params = makeParams()
    params.options.noWrap = true
    const result = generateText(params)
    expect(result).not.toContain('\n')
  })
})

describe('generateBlocks', () => {
  it('returns an array of strings', () => {
    const result = generateBlocks(makeParams())
    expect(Array.isArray(result)).toBe(true)
    result.forEach((block) => expect(typeof block).toBe('string'))
  })

  it('returns the requested number of blocks', () => {
    expect(generateBlocks(makeParams({ blocks: 1 }))).toHaveLength(1)
    expect(generateBlocks(makeParams({ blocks: 5 }))).toHaveLength(5)
    expect(generateBlocks(makeParams({ blocks: 10 }))).toHaveLength(10)
  })

  it('is deterministic', () => {
    const a = generateBlocks(makeParams())
    const b = generateBlocks(makeParams())
    expect(a).toEqual(b)
  })

  it('each block is non-empty', () => {
    const result = generateBlocks(makeParams({ blocks: 5 }))
    result.forEach((block) => expect(block.length).toBeGreaterThan(0))
  })
})

describe('DEFAULT_OPTIONS', () => {
  it('has all markdown features disabled by default', () => {
    expect(DEFAULT_OPTIONS.headers).toBe(false)
    expect(DEFAULT_OPTIONS.codeSnippets).toBe(false)
    expect(DEFAULT_OPTIONS.blockquotes).toBe(false)
    expect(DEFAULT_OPTIONS.lists).toBe(false)
    expect(DEFAULT_OPTIONS.links).toBe(false)
  })

  it('has capitalize enabled and noWrap disabled', () => {
    expect(DEFAULT_OPTIONS.capitalize).toBe(true)
    expect(DEFAULT_OPTIONS.noWrap).toBe(false)
  })
})

describe('generateBlocks matches generateText', () => {
  const everything = {
    headers: true, codeSnippets: true, blockquotes: true, lists: true, links: true, capitalize: true, noWrap: false,
  }

  it('returns blocks that all appear verbatim in the text when headers are on', () => {
    // Headings draw from the sequence that sizes the blocks; a separate replay
    // of the sizes used to return different blocks for almost every seed.
    for (let seed = 0; seed < 200; seed++) {
      const params = makeParams({ seed, blocks: 6, options: { ...DEFAULT_OPTIONS, headers: true } })
      const text = generateText(params)
      const blocks = generateBlocks(params)
      expect(blocks).toHaveLength(6)
      for (const block of blocks) expect(text).toContain(block)
    }
  })

  it('holds with every option on, wrapped and unwrapped, upper and lower case', () => {
    for (const noWrap of [false, true]) {
      for (const capitalize of [false, true]) {
        const params = makeParams({ seed: 7, blocks: 8, options: { ...everything, noWrap, capitalize } })
        const text = generateText(params)
        for (const block of generateBlocks(params)) expect(text).toContain(block)
      }
    }
  })
})

describe('markdownToPlainText', () => {
  const everything = {
    headers: true, codeSnippets: true, blockquotes: true, lists: true, links: true, capitalize: true, noWrap: false,
  }

  it('removes every marker from wrapped output', () => {
    const text = markdownToPlainText(generateText(makeParams({ blocks: 8, options: everything })))
    expect(text).not.toMatch(/[#>`[\]]/)
    expect(text).not.toMatch(/^- /m)
    expect(text).not.toContain('https://example.com')
    expect(text).toContain('Learn more')
  })

  it('removes mid-line markers from no-wrap output', () => {
    const text = markdownToPlainText(generateText(makeParams({ blocks: 8, options: { ...everything, noWrap: true } })))
    expect(text).not.toMatch(/[#>•`[\]]/)
    expect(text).not.toContain('\n')
    expect(text).not.toMatch(/ {2,}/)
    expect(text).toContain('Item one Item two Item three')
  })

  it('leaves plain text alone', () => {
    const plain = generateText(makeParams())
    expect(markdownToPlainText(plain)).toBe(plain)
  })
})

describe('seeds outside the normal range', () => {
  it('produces full text for negative seeds', () => {
    for (const seed of [-1, -6, -5000, -233281]) {
      const text = generateText(makeParams({ seed, blocks: 5 }))
      expect(text).not.toContain('undefined')
      expect(text.length).toBeGreaterThan(100)
      expect(text.split('\n\n')).toHaveLength(5)
    }
  })
})

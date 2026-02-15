/**
 * Unit tests for the shared text generation utility.
 *
 * @module tests/unit/generate
 */
import { describe, it, expect } from 'vitest'
import { generateText, generateBlocks, DEFAULT_OPTIONS } from '../../utils/generate'
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

/**
 * Unit tests for validating preferences read back from localStorage.
 *
 * @module tests/unit/usePreferences
 */
import { describe, it, expect } from 'vitest'
import { sanitizePreferences, DEFAULT_PREFERENCES } from '../../composables/usePreferences'

describe('sanitizePreferences', () => {
  it('returns valid preferences unchanged', () => {
    const saved = {
      theme: 'dog',
      blocks: 12,
      options: {
        headers: true, codeSnippets: false, blockquotes: true, lists: false, links: true, capitalize: false, noWrap: true,
      },
    }
    expect(sanitizePreferences(saved)).toEqual(saved)
  })

  it('falls back to defaults for values that are not objects', () => {
    for (const value of [null, undefined, 'dog', 7, true, []]) {
      expect(sanitizePreferences(value)).toEqual(DEFAULT_PREFERENCES)
    }
  })

  it('replaces an unknown theme', () => {
    expect(sanitizePreferences({ theme: 'no-such-theme' }).theme).toBe(DEFAULT_PREFERENCES.theme)
    expect(sanitizePreferences({ theme: 42 }).theme).toBe(DEFAULT_PREFERENCES.theme)
  })

  it('replaces a block count that is out of range or not a whole number', () => {
    for (const blocks of [0, 21, 1_000_000_000, -3, 2.5, '5', Number.NaN, null]) {
      expect(sanitizePreferences({ blocks }).blocks).toBe(DEFAULT_PREFERENCES.blocks)
    }
    expect(sanitizePreferences({ blocks: 1 }).blocks).toBe(1)
    expect(sanitizePreferences({ blocks: 20 }).blocks).toBe(20)
  })

  it('keeps boolean options, defaults the rest, and drops unknown keys', () => {
    const result = sanitizePreferences({
      options: { headers: true, lists: 'yes', capitalize: 0, injected: true },
    })
    expect(result.options.headers).toBe(true)
    expect(result.options.lists).toBe(DEFAULT_PREFERENCES.options.lists)
    expect(result.options.capitalize).toBe(DEFAULT_PREFERENCES.options.capitalize)
    expect(result.options).not.toHaveProperty('injected')
  })

  it('fills in options missing from an older saved shape', () => {
    expect(sanitizePreferences({ theme: 'cat', blocks: 3 })).toEqual({
      theme: 'cat',
      blocks: 3,
      options: DEFAULT_PREFERENCES.options,
    })
  })

  it('does not hand back the shared default options object', () => {
    const result = sanitizePreferences(null)
    result.options.headers = true
    expect(DEFAULT_PREFERENCES.options.headers).toBe(false)
  })
})

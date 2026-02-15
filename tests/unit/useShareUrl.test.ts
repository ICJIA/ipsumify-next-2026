/**
 * Tests for useShareUrl composable.
 *
 * @module tests/unit/useShareUrl
 */
import { describe, it, expect } from 'vitest'
import {
  encodePreferencesToUrl,
  decodePreferencesFromUrl,
} from '../../composables/useShareUrl'
import { DEFAULT_PREFERENCES } from '../../composables/usePreferences'

describe('useShareUrl', () => {
  describe('encodePreferencesToUrl', () => {
    it('should encode basic preferences', () => {
      const prefs = {
        theme: 'dog',
        blocks: 10,
        options: {
          headers: false,
          codeSnippets: false,
          blockquotes: false,
          lists: false,
          links: false,
          capitalize: true,
          noWrap: false,
        },
      }

      const params = encodePreferencesToUrl(prefs)

      expect(params.get('theme')).toBe('dog')
      expect(params.get('blocks')).toBe('10')
      expect(params.get('md')).toBeNull() // No markdown options enabled
      expect(params.get('lower')).toBeNull() // Capitalize is true
      expect(params.get('nowrap')).toBeNull() // NoWrap is false
    })

    it('should encode markdown options', () => {
      const prefs = {
        theme: 'lorem',
        blocks: 5,
        options: {
          headers: true,
          codeSnippets: true,
          blockquotes: false,
          lists: true,
          links: false,
          capitalize: true,
          noWrap: false,
        },
      }

      const params = encodePreferencesToUrl(prefs)
      const md = params.get('md')

      expect(md).toContain('headers')
      expect(md).toContain('code')
      expect(md).toContain('lists')
      expect(md).not.toContain('quotes')
      expect(md).not.toContain('links')
    })

    it('should encode formatting options', () => {
      const prefs = {
        theme: 'cat',
        blocks: 3,
        options: {
          headers: false,
          codeSnippets: false,
          blockquotes: false,
          lists: false,
          links: false,
          capitalize: false,
          noWrap: true,
        },
      }

      const params = encodePreferencesToUrl(prefs)

      expect(params.get('lower')).toBe('1')
      expect(params.get('nowrap')).toBe('1')
    })
  })

  describe('decodePreferencesFromUrl', () => {
    it('should decode basic preferences', () => {
      const params = new URLSearchParams('theme=bbq&blocks=15')
      const decoded = decodePreferencesFromUrl(params, DEFAULT_PREFERENCES)

      expect(decoded.theme).toBe('bbq')
      expect(decoded.blocks).toBe(15)
    })

    it('should decode markdown options', () => {
      const params = new URLSearchParams('md=headers,code,lists')
      const decoded = decodePreferencesFromUrl(params, DEFAULT_PREFERENCES)

      expect(decoded.options?.headers).toBe(true)
      expect(decoded.options?.codeSnippets).toBe(true)
      expect(decoded.options?.lists).toBe(true)
      expect(decoded.options?.blockquotes).toBe(false)
      expect(decoded.options?.links).toBe(false)
    })

    it('should decode formatting options', () => {
      const params = new URLSearchParams('lower=1&nowrap=1')
      const decoded = decodePreferencesFromUrl(params, DEFAULT_PREFERENCES)

      expect(decoded.options?.capitalize).toBe(false)
      expect(decoded.options?.noWrap).toBe(true)
    })

    it('should validate blocks range', () => {
      const validParams = new URLSearchParams('blocks=10')
      const validDecoded = decodePreferencesFromUrl(validParams, DEFAULT_PREFERENCES)
      expect(validDecoded.blocks).toBe(10)

      const tooLowParams = new URLSearchParams('blocks=0')
      const tooLowDecoded = decodePreferencesFromUrl(tooLowParams, DEFAULT_PREFERENCES)
      expect(tooLowDecoded.blocks).toBeUndefined()

      const tooHighParams = new URLSearchParams('blocks=25')
      const tooHighDecoded = decodePreferencesFromUrl(tooHighParams, DEFAULT_PREFERENCES)
      expect(tooHighDecoded.blocks).toBeUndefined()
    })

    it('should handle invalid blocks value', () => {
      const params = new URLSearchParams('blocks=invalid')
      const decoded = decodePreferencesFromUrl(params, DEFAULT_PREFERENCES)

      expect(decoded.blocks).toBeUndefined()
    })

    it('should reject unknown theme IDs', () => {
      const params = new URLSearchParams('theme=malicious_theme')
      const decoded = decodePreferencesFromUrl(params, DEFAULT_PREFERENCES)

      expect(decoded.theme).toBeUndefined()
    })

    it('should accept valid theme IDs', () => {
      const params = new URLSearchParams('theme=lorem')
      const decoded = decodePreferencesFromUrl(params, DEFAULT_PREFERENCES)

      expect(decoded.theme).toBe('lorem')
    })

    it('should return empty object for no params', () => {
      const params = new URLSearchParams('')
      const decoded = decodePreferencesFromUrl(params, DEFAULT_PREFERENCES)

      expect(Object.keys(decoded).length).toBe(0)
    })

    it('should round-trip encode/decode', () => {
      const original = {
        theme: 'baked',
        blocks: 7,
        options: {
          headers: true,
          codeSnippets: false,
          blockquotes: true,
          lists: true,
          links: false,
          capitalize: false,
          noWrap: true,
        },
      }

      const params = encodePreferencesToUrl(original)
      const decoded = decodePreferencesFromUrl(params, DEFAULT_PREFERENCES)

      expect(decoded.theme).toBe(original.theme)
      expect(decoded.blocks).toBe(original.blocks)
      expect(decoded.options).toEqual(original.options)
    })
  })
})

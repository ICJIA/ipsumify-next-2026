/**
 * Tests for useLocalStorage composable.
 *
 * @module tests/unit/useLocalStorage
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLocalStorage } from '../../composables/useLocalStorage'

describe('useLocalStorage', () => {
  let store: Record<string, string>

  beforeEach(() => {
    store = {}

    const localStorageMock = {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        const { [key]: _, ...rest } = store
        store = rest
      }),
      clear: vi.fn(() => {
        store = {}
      }),
      length: 0,
      key: vi.fn(() => null),
    }

    Object.defineProperty(globalThis, 'window', {
      value: { localStorage: localStorageMock },
      writable: true,
    })
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
  })

  it('should return default value when key does not exist', () => {
    const { get } = useLocalStorage('missing-key', 'default')
    expect(get()).toBe('default')
  })

  it('should store and retrieve a string value', () => {
    const { get, set } = useLocalStorage('test-key', '')
    set('hello')
    expect(get()).toBe('hello')
  })

  it('should store and retrieve an object', () => {
    const defaultVal = { theme: 'lorem', blocks: 5 }
    const { get, set } = useLocalStorage('prefs', defaultVal)

    set({ theme: 'dog', blocks: 10 })
    expect(get()).toEqual({ theme: 'dog', blocks: 10 })
  })

  it('should store and retrieve complex nested objects', () => {
    const defaultVal = { options: { headers: false, nested: { deep: '' } } }
    const { get, set } = useLocalStorage('complex', defaultVal)

    const value = { options: { headers: true, nested: { deep: 'value' } } }
    set(value)
    expect(get()).toEqual(value)
    expect(get().options.nested.deep).toBe('value')
  })

  it('should remove a stored value', () => {
    const { get, set, remove } = useLocalStorage('remove-key', 'default')

    set('stored')
    expect(get()).toBe('stored')

    remove()
    expect(get()).toBe('default')
  })

  it('should return default value for corrupted JSON', () => {
    // Manually inject bad JSON into the store
    store['bad-json'] = '{invalid json'

    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { get } = useLocalStorage('bad-json', 'fallback')
    expect(get()).toBe('fallback')
    consoleWarn.mockRestore()
  })

  it('should handle boolean default values', () => {
    const { get, set } = useLocalStorage('flag', false)
    expect(get()).toBe(false)

    set(true)
    expect(get()).toBe(true)
  })

  it('should handle numeric default values', () => {
    const { get, set } = useLocalStorage('count', 0)
    expect(get()).toBe(0)

    set(42)
    expect(get()).toBe(42)
  })
})

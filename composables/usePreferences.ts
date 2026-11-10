/**
 * Composable for managing user preferences with localStorage persistence.
 *
 * @module composables/usePreferences
 */
import config from '../ipsumify.config'
import { useLocalStorage } from './useLocalStorage'
import { themes } from '../data/themes'

const VALID_THEME_IDS = new Set(themes.map(t => t.id))
const MIN_BLOCKS = 1
const MAX_BLOCKS = 20

/**
 * User preferences structure.
 */
export interface UserPreferences {
  /** Selected theme ID */
  theme: string
  /** Number of blocks to generate */
  blocks: number
  /** Markdown options */
  options: {
    headers: boolean
    codeSnippets: boolean
    blockquotes: boolean
    lists: boolean
    links: boolean
    capitalize: boolean
    noWrap: boolean
  }
}

/**
 * Default preferences from config.
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: config.defaultThemeId,
  blocks: config.defaultBlocks,
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

/**
 * Turns whatever was in localStorage into valid preferences.
 *
 * Storage is outside the app's control: it can hold an older shape, a value
 * edited by hand, or `null`. Each field is kept only if it is the right type
 * and in range, and replaced by its default otherwise, so a bad value can
 * neither throw on load nor ask the generator for a billion blocks.
 *
 * @param value - The parsed localStorage value, of unknown shape
 * @returns Preferences that are always safe to apply
 */
export function sanitizePreferences(value: unknown): UserPreferences {
  const source = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>
  const rawOptions = (typeof source.options === 'object' && source.options !== null
    ? source.options
    : {}) as Record<string, unknown>

  const options = { ...DEFAULT_PREFERENCES.options }
  for (const key of Object.keys(options) as (keyof UserPreferences['options'])[]) {
    if (typeof rawOptions[key] === 'boolean') {
      options[key] = rawOptions[key] as boolean
    }
  }

  const blocks = source.blocks
  return {
    theme: typeof source.theme === 'string' && VALID_THEME_IDS.has(source.theme)
      ? source.theme
      : DEFAULT_PREFERENCES.theme,
    blocks: typeof blocks === 'number' && Number.isInteger(blocks) && blocks >= MIN_BLOCKS && blocks <= MAX_BLOCKS
      ? blocks
      : DEFAULT_PREFERENCES.blocks,
    options,
  }
}

/**
 * localStorage key for preferences.
 */
const PREFERENCES_KEY = 'ipsumify:preferences'

/**
 * Hook for managing user preferences.
 *
 * @returns Object with preferences state and methods to load/save
 */
export function usePreferences() {
  const storage = useLocalStorage<unknown>(
    PREFERENCES_KEY,
    DEFAULT_PREFERENCES
  )

  /**
   * Loads preferences from localStorage.
   *
   * @returns The saved preferences, with any invalid field replaced by its default
   */
  function loadPreferences(): UserPreferences {
    return sanitizePreferences(storage.get())
  }

  /**
   * Saves preferences to localStorage.
   *
   * @param preferences - The preferences to save
   */
  function savePreferences(preferences: UserPreferences): void {
    storage.set(preferences)
  }

  /**
   * Removes the saved preferences from localStorage.
   */
  function resetPreferences(): void {
    storage.remove()
  }

  return {
    loadPreferences,
    savePreferences,
    resetPreferences,
    DEFAULT_PREFERENCES,
  }
}

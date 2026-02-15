/**
 * Composable for managing user preferences with localStorage persistence.
 *
 * @module composables/usePreferences
 */
import config from '../ipsumify.config'
import { useLocalStorage } from './useLocalStorage'

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
 * localStorage key for preferences.
 */
const PREFERENCES_KEY = 'ipsumify:preferences'

/**
 * Hook for managing user preferences.
 *
 * @returns Object with preferences state and methods to load/save
 */
export function usePreferences() {
  const storage = useLocalStorage<UserPreferences>(
    PREFERENCES_KEY,
    DEFAULT_PREFERENCES
  )

  /**
   * Loads preferences from localStorage.
   *
   * @returns The saved preferences or default preferences
   */
  function loadPreferences(): UserPreferences {
    return storage.get()
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
   * Resets preferences to defaults and clears localStorage.
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

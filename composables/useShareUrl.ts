/**
 * Composable for managing shareable URLs with encoded settings.
 *
 * @module composables/useShareUrl
 */
import type { UserPreferences } from './usePreferences'
import { themes } from '../data/themes'
import { copyToClipboard } from '../utils/clipboard'

/** Valid theme IDs for URL validation */
const VALID_THEME_IDS = new Set(themes.map(t => t.id))

/**
 * Encodes user preferences into URL search parameters.
 *
 * @param preferences - The user preferences to encode
 * @returns URLSearchParams with encoded preferences
 */
export function encodePreferencesToUrl(preferences: UserPreferences): URLSearchParams {
  const params = new URLSearchParams()

  // Add theme
  params.set('theme', preferences.theme)

  // Add blocks
  params.set('blocks', preferences.blocks.toString())

  // Add markdown options (only include enabled ones to keep URL shorter)
  const enabledOptions: string[] = []
  if (preferences.options.headers) enabledOptions.push('headers')
  if (preferences.options.codeSnippets) enabledOptions.push('code')
  if (preferences.options.blockquotes) enabledOptions.push('quotes')
  if (preferences.options.lists) enabledOptions.push('lists')
  if (preferences.options.links) enabledOptions.push('links')

  if (enabledOptions.length > 0) {
    params.set('md', enabledOptions.join(','))
  }

  // Add formatting options
  if (!preferences.options.capitalize) {
    params.set('lower', '1')
  }
  if (preferences.options.noWrap) {
    params.set('nowrap', '1')
  }

  return params
}

/**
 * Decodes URL search parameters into user preferences.
 *
 * @param params - URL search parameters to decode
 * @param defaultPreferences - Default preferences to use as fallback
 * @returns Decoded user preferences
 */
export function decodePreferencesFromUrl(
  params: URLSearchParams,
  defaultPreferences: UserPreferences
): Partial<UserPreferences> {
  const decoded: Partial<UserPreferences> = {}

  // Decode theme (only accept known theme IDs)
  const theme = params.get('theme')
  if (theme && VALID_THEME_IDS.has(theme)) {
    decoded.theme = theme
  }

  // Decode blocks
  const blocks = params.get('blocks')
  if (blocks) {
    const blocksNum = parseInt(blocks, 10)
    if (!isNaN(blocksNum) && blocksNum >= 1 && blocksNum <= 20) {
      decoded.blocks = blocksNum
    }
  }

  // Decode markdown and formatting options
  const md = params.get('md')
  const lower = params.get('lower')
  const nowrap = params.get('nowrap')

  if (md || lower || nowrap) {
    decoded.options = { ...defaultPreferences.options }

    // Parse markdown options
    if (md) {
      const enabledOptions = md.split(',')
      decoded.options.headers = enabledOptions.includes('headers')
      decoded.options.codeSnippets = enabledOptions.includes('code')
      decoded.options.blockquotes = enabledOptions.includes('quotes')
      decoded.options.lists = enabledOptions.includes('lists')
      decoded.options.links = enabledOptions.includes('links')
    }

    // Parse formatting options
    if (lower === '1') {
      decoded.options.capitalize = false
    }
    if (nowrap === '1') {
      decoded.options.noWrap = true
    }
  }

  return decoded
}

/**
 * Hook for managing share URLs.
 *
 * @returns Methods for generating and copying share URLs
 */
export function useShareUrl() {
  /**
   * Generates a shareable URL with encoded preferences.
   *
   * @param preferences - User preferences to encode
   * @returns Full shareable URL
   */
  function generateShareUrl(preferences: UserPreferences): string {
    if (import.meta.server) {
      return ''
    }

    const params = encodePreferencesToUrl(preferences)
    const url = new URL(window.location.href)
    url.search = params.toString()
    return url.toString()
  }

  /**
   * Copies the shareable URL to clipboard.
   *
   * @param preferences - User preferences to encode
   * @returns Promise that resolves when copied
   */
  async function copyShareUrl(preferences: UserPreferences): Promise<void> {
    const url = generateShareUrl(preferences)
    await copyToClipboard(url)
  }

  /**
   * Loads preferences from current URL if present.
   *
   * @param defaultPreferences - Default preferences to use as fallback
   * @returns Decoded preferences from URL or empty object
   */
  function loadFromUrl(defaultPreferences: UserPreferences): Partial<UserPreferences> {
    if (import.meta.server) {
      return {}
    }

    const params = new URLSearchParams(window.location.search)
    return decodePreferencesFromUrl(params, defaultPreferences)
  }

  return {
    generateShareUrl,
    copyShareUrl,
    loadFromUrl,
  }
}

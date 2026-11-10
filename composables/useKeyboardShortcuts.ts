/**
 * Composable for managing keyboard shortcuts.
 *
 * @module composables/useKeyboardShortcuts
 */

/**
 * Keyboard shortcut handler function type.
 */
export type ShortcutHandler = (event: KeyboardEvent) => void

/**
 * Keyboard shortcut definition.
 */
export interface KeyboardShortcut {
  /** Keyboard key (e.g., 'r', 'k', 'd') */
  key: string
  /** Whether Alt+Shift is required */
  altShift?: boolean
  /** Handler function to execute */
  handler: ShortcutHandler
  /** Description for UI display */
  description: string
}

/**
 * Hook for registering keyboard shortcuts with automatic cleanup.
 *
 * @param shortcuts - Array of keyboard shortcut definitions
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  /**
   * Handles keyboard events and triggers matching shortcuts.
   *
   * @param event - The keyboard event
   */
  function handleKeyDown(event: KeyboardEvent) {
    // Autofill and some input methods dispatch keydown events with no key
    if (typeof event.key !== 'string') return
    // A held chord fires repeatedly; one press is one action (holding
    // Alt+Shift+D used to save the file over and over)
    if (event.repeat) return
    // Leave typing alone
    const target = event.target as HTMLElement | null
    if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')) return

    for (const shortcut of shortcuts) {
      // Exactly the stated modifiers: Ctrl or Cmd with the chord is some
      // other shortcut, the browser's or the system's
      const matchesModifier = !event.ctrlKey && !event.metaKey
        && (shortcut.altShift ? event.altKey && event.shiftKey : !event.altKey)
      // Match on event.key first, then fall back to event.code for letter
      // keys. macOS Option+Shift produces special characters (e.g., ‰ for
      // Option+Shift+R), so event.key won't match the shortcut letter.
      // event.code reflects the physical key regardless of modifiers.
      const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase()
        || (shortcut.key.length === 1 && /^[a-z]$/i.test(shortcut.key)
          && event.code === `Key${shortcut.key.toUpperCase()}`)

      if (matchesKey && matchesModifier) {
        event.preventDefault()
        shortcut.handler(event)
        break
      }
    }
  }

  // onMounted and onUnmounted only ever run in the browser
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    shortcuts,
  }
}

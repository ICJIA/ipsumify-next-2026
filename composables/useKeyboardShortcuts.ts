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
    for (const shortcut of shortcuts) {
      const altShiftPressed = event.altKey && event.shiftKey
      const matchesModifier = shortcut.altShift ? altShiftPressed : true
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

  /**
   * Registers keyboard event listeners on mount and cleans up on unmount.
   */
  onMounted(() => {
    if (import.meta.client) {
      window.addEventListener('keydown', handleKeyDown)
    }
  })

  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  return {
    shortcuts,
  }
}

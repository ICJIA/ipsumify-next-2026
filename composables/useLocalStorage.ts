/**
 * Composable for safely managing localStorage in SSR/hydration-safe manner.
 *
 * @module composables/useLocalStorage
 */

/**
 * Safely reads and writes to localStorage with SSR/hydration safety.
 * Only accesses localStorage on the client-side.
 *
 * @param key - The localStorage key
 * @param defaultValue - Default value if key doesn't exist or on server
 * @returns Object with get(), set(), and remove() methods
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  /**
   * Gets the value from localStorage, or returns default if not available.
   *
   * @returns The stored value or defaultValue
   */
  function get(): T {
    if (import.meta.server) {
      return defaultValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  }

  /**
   * Sets a value in localStorage.
   *
   * @param value - The value to store
   */
  function set(value: T): void {
    if (import.meta.server) {
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  /**
   * Removes a value from localStorage.
   */
  function remove(): void {
    if (import.meta.server) {
      return
    }

    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }

  return {
    get,
    set,
    remove,
  }
}

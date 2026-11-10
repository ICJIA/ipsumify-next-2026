/**
 * Unit tests for the keyboard shortcut handler.
 *
 * @module tests/unit/keyboard
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// The composable registers its listener in onMounted; run that immediately
const unmount: (() => void)[] = []
vi.stubGlobal('onMounted', (fn: () => void) => fn())
vi.stubGlobal('onUnmounted', (fn: () => void) => unmount.push(fn))

const { useKeyboardShortcuts } = await import('../../composables/useKeyboardShortcuts')

function press(init: KeyboardEventInit, target: EventTarget = window) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event
}

describe('useKeyboardShortcuts', () => {
  const download = vi.fn()
  const help = vi.fn()

  beforeEach(() => {
    download.mockClear()
    help.mockClear()
    useKeyboardShortcuts([
      { key: 'd', altShift: true, handler: download, description: 'Download' },
      { key: '?', handler: help, description: 'Help' },
    ])
  })

  afterEach(() => {
    while (unmount.length) unmount.pop()!()
  })

  it('fires on the chord, by key or by physical key', () => {
    press({ key: 'D', altKey: true, shiftKey: true })
    // macOS: Option+Shift+D types a special character
    press({ key: 'Î', code: 'KeyD', altKey: true, shiftKey: true })
    expect(download).toHaveBeenCalledTimes(2)
  })

  it('fires once for a held chord', () => {
    press({ key: 'D', altKey: true, shiftKey: true })
    for (let i = 0; i < 10; i++) press({ key: 'D', altKey: true, shiftKey: true, repeat: true })
    expect(download).toHaveBeenCalledTimes(1)
  })

  it('ignores the chord with Ctrl or Cmd added, and the plain letter', () => {
    press({ key: 'D', altKey: true, shiftKey: true, ctrlKey: true })
    press({ key: 'D', altKey: true, shiftKey: true, metaKey: true })
    press({ key: 'd' })
    press({ key: 'D', shiftKey: true })
    expect(download).not.toHaveBeenCalled()
  })

  it('opens help on ? alone, not with Ctrl, Cmd or Alt', () => {
    expect(press({ key: '?', shiftKey: true }).defaultPrevented).toBe(true)
    expect(help).toHaveBeenCalledTimes(1)
    for (const modifier of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
      expect(press({ key: '?', shiftKey: true, ...modifier }).defaultPrevented).toBe(false)
    }
    expect(help).toHaveBeenCalledTimes(1)
  })

  it('does not throw on a keydown event with no key', () => {
    // Browser autofill dispatches these
    expect(() => window.dispatchEvent(new Event('keydown'))).not.toThrow()
  })

  it('leaves typing in a field alone', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    press({ key: '?', shiftKey: true }, input)
    input.remove()
    expect(help).not.toHaveBeenCalled()
  })
})

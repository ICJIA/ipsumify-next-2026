/**
 * Clipboard utility with fallback for older browsers.
 *
 * @module utils/clipboard
 */

/**
 * Copies text to clipboard using the modern Clipboard API with
 * a textarea-based fallback for older browsers.
 *
 * @param text - The text to copy to clipboard
 * @throws Error if both methods fail
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  // Fallback for older browsers
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  textArea.setAttribute('readonly', '')
  document.body.appendChild(textArea)
  textArea.select()

  try {
    const successful = document.execCommand('copy')
    if (!successful) {
      throw new Error('Copy command failed')
    }
  } finally {
    document.body.removeChild(textArea)
  }
}

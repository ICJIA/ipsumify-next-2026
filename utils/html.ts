/**
 * HTML rendering of generated text, shared by the web UI, the API and the
 * npm package.
 *
 * @module utils/html
 */
import { marked } from 'marked'
import { generateText } from './generate'
import type { GenerateParams } from './generate'

/**
 * Generates text and renders it as HTML.
 *
 * The HTML is always rendered from the wrapped markdown. No-wrap markdown is
 * one line, and a line that starts with "# " is a heading from its first
 * character to its last, so rendering it directly put the whole text inside
 * a single <h1>. In no-wrap mode the same structure is returned on one line.
 *
 * @param params - Generation parameters
 * @returns HTML, without a trailing newline
 */
export function renderHtml(params: GenerateParams): string {
  const wrapped = generateText({ ...params, options: { ...params.options, noWrap: false } })
  const html = (marked.parse(wrapped, { async: false }) as string).trimEnd()
  return params.options.noWrap ? html.replace(/\n/g, '') : html
}

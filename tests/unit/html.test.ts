/**
 * Unit tests for HTML rendering.
 *
 * @module tests/unit/html
 */
import { describe, it, expect } from 'vitest'
import { renderHtml } from '../../utils/html'
import { DEFAULT_OPTIONS } from '../../utils/generate'
import { themes } from '../../data/themes'

const lorem = themes[0]!
const everything = { headers: true, codeSnippets: true, blockquotes: true, lists: true, links: true, capitalize: true, noWrap: false }

describe('renderHtml', () => {
  it('renders paragraphs', () => {
    const html = renderHtml({ theme: lorem, blocks: 3, seed: 42, options: { ...DEFAULT_OPTIONS } })
    expect(html.match(/<p>/g)).toHaveLength(3)
    expect(html.endsWith('</p>')).toBe(true)
  })

  it('keeps headings short in no-wrap mode', () => {
    // No-wrap markdown is one line starting with "# ", which is one enormous
    // heading; the whole text used to come back inside a single <h1>.
    const html = renderHtml({ theme: lorem, blocks: 4, seed: 42, options: { ...everything, noWrap: true } })
    expect(html).not.toContain('\n')
    const h1 = html.match(/<h1>(.*?)<\/h1>/)
    expect(h1?.[1]?.length).toBeLessThan(60)
    expect(html).toContain('<p>')
    expect(html).toContain('<li>')
    expect(html).toContain('<blockquote>')
  })

  it('has the same structure wrapped and unwrapped', () => {
    const wrapped = renderHtml({ theme: lorem, blocks: 6, seed: 9, options: everything })
    const oneLine = renderHtml({ theme: lorem, blocks: 6, seed: 9, options: { ...everything, noWrap: true } })
    expect(oneLine).toBe(wrapped.replace(/\n/g, ''))
  })
})

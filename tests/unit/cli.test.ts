/**
 * Unit tests for the npm package: the library and its command line.
 *
 * @module tests/unit/cli
 */
import { describe, it, expect } from 'vitest'
import { ipsumify, paragraphs, themes, FORMATS } from '../../packages/ipsumify/src/index'
import { run, HELP } from '../../packages/ipsumify/src/run'
import { themes as themeData } from '../../data/themes'
import { generateText, DEFAULT_OPTIONS } from '../../utils/generate'
import config from '../../ipsumify.config'
import rootPackage from '../../package.json'
import npmPackage from '../../packages/ipsumify/package.json'

const lorem = themeData.find(t => t.id === 'lorem')!

describe('versions', () => {
  it('agree across the app, its config and the npm package', () => {
    // publish.sh publishes the release's version, so the three must move together
    expect(config.version).toBe(rootPackage.version)
    expect(npmPackage.version).toBe(rootPackage.version)
  })

  it('ships the npm package with no dependencies or scripts', () => {
    for (const field of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies', 'scripts']) {
      expect(npmPackage).not.toHaveProperty(field)
    }
  })
})

describe('ipsumify()', () => {
  it('returns five paragraphs by default', () => {
    expect(ipsumify().split('\n\n')).toHaveLength(5)
  })

  it('gives the same text as the web app and API for the same seed', () => {
    const expected = generateText({ theme: lorem, blocks: 5, seed: 42, options: { ...DEFAULT_OPTIONS } })
    expect(ipsumify({ seed: 42 })).toBe(expected)
  })

  it('is random without a seed and repeatable with one', () => {
    const samples = new Set(Array.from({ length: 12 }, () => ipsumify()))
    expect(samples.size).toBeGreaterThan(1)
    expect(ipsumify({ seed: 7 })).toBe(ipsumify({ seed: 7 }))
  })

  it('applies theme, markdown elements and formatting', () => {
    const text = ipsumify({ theme: 'dog', blocks: 4, seed: 1, headers: true, lists: true, code: true, quotes: true, links: true })
    expect(text).toMatch(/^# /)
    expect(text).toMatch(/^- /m)
    expect(text).toContain('```javascript')
    expect(text).toMatch(/^> /m)
    expect(text).toContain('](https://example.com)')

    const oneLine = ipsumify({ blocks: 3, seed: 1, noWrap: true, lowercase: true })
    expect(oneLine).not.toContain('\n')
    expect(oneLine).toBe(oneLine.toLowerCase())
  })

  it('renders text and html formats', () => {
    const text = ipsumify({ seed: 3, headers: true, lists: true, format: 'text' })
    expect(text).not.toMatch(/[#`>]/)
    const html = ipsumify({ seed: 3, headers: true, lists: true, format: 'html' })
    expect(html).toMatch(/^<h1>/)
    expect(html).toContain('<li>')
  })

  it('rejects invalid options', () => {
    expect(() => ipsumify({ theme: 'nope' })).toThrow(RangeError)
    expect(() => ipsumify({ blocks: 0 })).toThrow(RangeError)
    expect(() => ipsumify({ blocks: 21 })).toThrow(RangeError)
    expect(() => ipsumify({ blocks: 2.5 })).toThrow(RangeError)
    expect(() => ipsumify({ seed: -1 })).toThrow(RangeError)
    expect(() => ipsumify({ format: 'pdf' as never })).toThrow(RangeError)
  })

  it('lists the themes and returns paragraphs as an array', () => {
    expect(themes.map(t => t.id)).toEqual(['lorem', 'dog', 'cat', 'baked', 'bbq'])
    const blocks = paragraphs({ blocks: 3, seed: 9, headers: true })
    expect(blocks).toHaveLength(3)
    const text = ipsumify({ blocks: 3, seed: 9, headers: true })
    for (const block of blocks) expect(text).toContain(block)
  })
})

describe('command line', () => {
  it('prints five paragraphs with no arguments', () => {
    const result = run([])
    expect(result.code).toBe(0)
    expect(result.stderr).toBe('')
    expect(result.stdout.endsWith('\n')).toBe(true)
    expect(result.stdout.trimEnd().split('\n\n')).toHaveLength(5)
  })

  it('takes the block count three ways', () => {
    const expected = run(['--blocks', '2', '--seed', '42']).stdout
    expect(expected.trimEnd().split('\n\n')).toHaveLength(2)
    expect(run(['2', '--seed', '42']).stdout).toBe(expected)
    expect(run(['-p', '2', '-s', '42']).stdout).toBe(expected)
  })

  it('matches the library for the same options', () => {
    expect(run(['--theme', 'cat', '-b', '3', '--seed', '5', '--headings', '--lists']).stdout)
      .toBe(ipsumify({ theme: 'cat', blocks: 3, seed: 5, headers: true, lists: true }) + '\n')
  })

  it('treats --all, --md and the individual flags alike', () => {
    const all = run(['--all', '--seed', '8']).stdout
    expect(run(['--md', 'headings,code,quotes,lists,links', '--seed', '8']).stdout).toBe(all)
    expect(run(['--headers', '--code', '--quotes', '--lists', '--links', '--seed', '8']).stdout).toBe(all)
  })

  it('removes line breaks with --no-linebreaks or --nowrap', () => {
    const result = run(['3', '--no-linebreaks', '--lower', '--seed', '2'])
    expect(result.stdout.trimEnd()).not.toContain('\n')
    expect(result.stdout).toBe(result.stdout.toLowerCase())
    expect(run(['3', '--nowrap', '--lower', '--seed', '2']).stdout).toBe(result.stdout)
  })

  it('prints json in the API\'s shape, including the seed it chose', () => {
    const json = JSON.parse(run(['--format', 'json', '-b', '2', '--headings']).stdout)
    expect(json).toMatchObject({ theme: 'lorem', blocks: 2, format: 'json' })
    expect(Number.isInteger(json.seed)).toBe(true)
    expect(json.options.headers).toBe(true)
    expect(json.output).toHaveLength(2)
    for (const block of json.output) expect(json.markdown).toContain(block)
    // The reported seed reproduces the text
    expect(run(['-b', '2', '--headings', '--seed', String(json.seed)]).stdout).toBe(json.markdown + '\n')
  })

  it('prints html and text', () => {
    expect(run(['--all', '--format', 'html', '--seed', '1']).stdout).toMatch(/^<h1>/)
    expect(run(['--all', '--format', 'text', '--seed', '1']).stdout).not.toMatch(/[#`>]/)
  })

  it('prints help, version and themes', () => {
    expect(run(['--help'])).toEqual({ code: 0, stdout: HELP, stderr: '' })
    expect(run(['-v'], '9.9.9').stdout).toBe('9.9.9\n')
    const listed = run(['--themes']).stdout
    for (const theme of themes) expect(listed).toContain(theme.id)
  })

  it('exits 1 with a message for bad input', () => {
    for (const argv of [
      ['--theme', 'nope'], ['--blocks', '0'], ['--blocks', '21'], ['abc'], ['--seed', '-1'], ['--seed', '1.5'],
      ['--format', 'pdf'], ['--md', 'tables'], ['--bogus'], ['2', '3'],
    ]) {
      const result = run(argv)
      expect(result.code).toBe(1)
      expect(result.stdout).toBe('')
      expect(result.stderr).toMatch(/^ipsumify: /)
    }
  })
})

describe('hardening', () => {
  it('refuses a block count given more than once', () => {
    for (const argv of [['3', '--blocks', '1'], ['-b', '1', '-p', '2'], ['2', '-p', '2']]) {
      const result = run(argv)
      expect(result.code).toBe(1)
      expect(result.stderr).toContain('more than once')
    }
  })

  it('refuses --md names that are only object properties', () => {
    for (const name of ['__proto__', 'constructor', 'toString', 'valueOf', 'hasOwnProperty']) {
      expect(run(['1', '--md', name]).code).toBe(1)
    }
  })

  it('renders no-wrap html with a short heading, not one giant one', () => {
    const html = run(['3', '--headings', '--nowrap', '--format', 'html', '--seed', '42']).stdout.trimEnd()
    expect(html).not.toContain('\n')
    expect(html.match(/<h1>(.*?)<\/h1>/)?.[1]?.length).toBeLessThan(60)
  })

  it('throws a TypeError for options that are not an object', () => {
    for (const value of ['dog', 3, [], null, true]) {
      expect(() => ipsumify(value as never)).toThrow(TypeError)
      expect(() => paragraphs(value as never)).toThrow(TypeError)
    }
  })

  it('throws a TypeError for a switch that is not a boolean', () => {
    expect(() => ipsumify({ headers: 'false' as never })).toThrow(TypeError)
    expect(() => ipsumify({ noWrap: 1 as never })).toThrow(TypeError)
  })

  it('ignores format in paragraphs(), as documented', () => {
    expect(paragraphs({ blocks: 2, seed: 1, format: 'nope' as never })).toHaveLength(2)
  })

  it('exports frozen lists', () => {
    expect(Object.isFrozen(themes)).toBe(true)
    expect(Object.isFrozen(FORMATS)).toBe(true)
  })
})

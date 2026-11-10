/**
 * The command line, as a function: arguments in, output and exit code out.
 * Kept free of process and console so it can be tested directly.
 *
 * @module ipsumify/run
 */
import { parseArgs } from 'node:util'
import {
  ipsumify, paragraphs, randomSeed, themes,
  DEFAULT_BLOCKS, DEFAULT_THEME, MIN_BLOCKS, MAX_BLOCKS, MAX_SEED, FORMATS,
} from './index'
import type { Format, IpsumifyOptions } from './index'

export interface RunResult {
  code: number
  stdout: string
  stderr: string
}

const CLI_FORMATS = [...FORMATS, 'json']

export const HELP = `ipsumify — lorem ipsum generator

Usage
  npx ipsumify [blocks] [options]

  With no arguments, prints ${DEFAULT_BLOCKS} paragraphs of lorem ipsum.

Content
  -b, --blocks <n>      Number of paragraphs, ${MIN_BLOCKS}-${MAX_BLOCKS} (default ${DEFAULT_BLOCKS}).
                        Also accepted as the first argument, or as --paragraphs.
  -t, --theme <id>      ${themes.map(t => t.id).join(', ')} (default ${DEFAULT_THEME})
  -s, --seed <n>        Whole number, 0-${MAX_SEED}. The same seed always
                        gives the same text. Random when omitted.

Markdown elements
      --headings        Add headings (also --headers)
      --code            Add code snippets
      --quotes          Add blockquotes
      --lists           Add bullet lists
      --links           Add links
  -a, --all             All five of the above
      --md <list>       The same, comma-separated: --md headings,lists

Formatting
      --lower           Lowercase everything
      --no-linebreaks   Everything on one line (also --nowrap)
  -f, --format <name>   markdown (default), text, html, json

Other
      --themes          List the themes
  -h, --help            Show this help
  -v, --version         Show the version

Examples
  npx ipsumify
  npx ipsumify 2
  npx ipsumify --theme dog --blocks 3
  npx ipsumify --headings --lists --seed 42
  npx ipsumify 1 --no-linebreaks --lower
  npx ipsumify --all --format html > sample.html
  npx ipsumify | pbcopy
`

type MdOption = 'headers' | 'code' | 'quotes' | 'lists' | 'links'

// A Map, not an object: "constructor" and "__proto__" are not markdown elements
const MD_NAMES: ReadonlyMap<string, MdOption> = new Map([
  ['headings', 'headers'],
  ['headers', 'headers'],
  ['code', 'code'],
  ['quotes', 'quotes'],
  ['lists', 'lists'],
  ['links', 'links'],
])

function fail(message: string): RunResult {
  return { code: 1, stdout: '', stderr: `ipsumify: ${message}\nRun "ipsumify --help" for usage.\n` }
}

function wholeNumber(name: string, value: string): number {
  if (!/^\d{1,10}$/.test(value)) {
    throw new RangeError(`Invalid ${name} "${value}". Must be a whole number.`)
  }
  return Number(value)
}

/**
 * Runs the command line.
 *
 * @param argv - Arguments after the program name
 * @param version - Version string to print for --version
 */
export function run(argv: string[], version = '0.0.0'): RunResult {
  let parsed
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        'blocks': { type: 'string', short: 'b' },
        'paragraphs': { type: 'string', short: 'p' },
        'theme': { type: 'string', short: 't' },
        'seed': { type: 'string', short: 's' },
        'headings': { type: 'boolean' },
        'headers': { type: 'boolean' },
        'code': { type: 'boolean' },
        'quotes': { type: 'boolean' },
        'lists': { type: 'boolean' },
        'links': { type: 'boolean' },
        'all': { type: 'boolean', short: 'a' },
        'md': { type: 'string' },
        'lower': { type: 'boolean' },
        'nowrap': { type: 'boolean' },
        'no-linebreaks': { type: 'boolean' },
        'format': { type: 'string', short: 'f' },
        'themes': { type: 'boolean' },
        'help': { type: 'boolean', short: 'h' },
        'version': { type: 'boolean', short: 'v' },
      },
    })
  }
  catch (error) {
    return fail((error as Error).message)
  }

  const { values, positionals } = parsed

  if (values.help) return { code: 0, stdout: HELP, stderr: '' }
  if (values.version) return { code: 0, stdout: `${version}\n`, stderr: '' }
  if (values.themes) {
    const width = Math.max(...themes.map(t => t.id.length))
    return { code: 0, stdout: themes.map(t => `${t.id.padEnd(width)}  ${t.label}`).join('\n') + '\n', stderr: '' }
  }

  try {
    if (positionals.length > 1) {
      throw new RangeError(`Unexpected argument "${positionals[1]}".`)
    }
    const blockCounts = [values.blocks, values.paragraphs, positionals[0]].filter(value => value !== undefined)
    if (blockCounts.length > 1) {
      throw new RangeError('The number of blocks is given more than once. Use one of: a first argument, --blocks, --paragraphs.')
    }
    const blocksArg = blockCounts[0]

    const options: IpsumifyOptions = {
      theme: values.theme,
      blocks: blocksArg === undefined ? undefined : wholeNumber('blocks', blocksArg),
      // Chosen here, not inside the library, so the json output can report it
      seed: values.seed === undefined ? randomSeed() : wholeNumber('seed', values.seed),
      headers: values.all || values.headings || values.headers,
      code: values.all || values.code,
      quotes: values.all || values.quotes,
      lists: values.all || values.lists,
      links: values.all || values.links,
      lowercase: values.lower,
      noWrap: values.nowrap || values['no-linebreaks'],
    }

    if (values.md !== undefined) {
      for (const name of values.md.split(',').map(part => part.trim()).filter(Boolean)) {
        const key = MD_NAMES.get(name)
        if (!key) {
          throw new RangeError(`Invalid --md value "${name}". Valid values: headings, code, quotes, lists, links`)
        }
        options[key] = true
      }
    }

    const format = values.format ?? 'markdown'
    if (!CLI_FORMATS.includes(format)) {
      throw new RangeError(`Invalid format "${format}". Valid formats: ${CLI_FORMATS.join(', ')}`)
    }

    if (format === 'json') {
      const markdown = ipsumify(options)
      const json = {
        theme: options.theme ?? DEFAULT_THEME,
        blocks: options.blocks ?? DEFAULT_BLOCKS,
        seed: options.seed,
        format,
        options: {
          headers: !!options.headers,
          codeSnippets: !!options.code,
          blockquotes: !!options.quotes,
          lists: !!options.lists,
          links: !!options.links,
          capitalize: !options.lowercase,
          noWrap: !!options.noWrap,
        },
        output: paragraphs(options),
        markdown,
      }
      return { code: 0, stdout: JSON.stringify(json, null, 2) + '\n', stderr: '' }
    }

    return { code: 0, stdout: ipsumify({ ...options, format: format as Format }) + '\n', stderr: '' }
  }
  catch (error) {
    return fail((error as Error).message)
  }
}

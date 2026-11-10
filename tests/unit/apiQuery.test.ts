/**
 * Unit tests for the API's strict query parsing.
 *
 * @module tests/unit/apiQuery
 */
import { describe, it, expect } from 'vitest'
import { parseApiQuery, ApiQueryError } from '../../utils/apiQuery'

const context = { themeIds: ['lorem', 'dog', 'cat', 'baked', 'bbq'] }
const parse = (search: string) => parseApiQuery(search, context)

describe('parseApiQuery', () => {
  it('returns nothing for an empty query', () => {
    expect(parse('')).toEqual({})
    expect(parse('?')).toEqual({})
  })

  it('parses every parameter', () => {
    expect(parse('?theme=dog&blocks=3&seed=42&md=headers,lists&lower=1&nowrap=1&format=json')).toEqual({
      theme: 'dog', blocks: 3, seed: 42, md: ['headers', 'lists'], lower: true, nowrap: true, format: 'json',
    })
  })

  it('accepts the range limits', () => {
    expect(parse('blocks=1&seed=0')).toEqual({ blocks: 1, seed: 0 })
    expect(parse('blocks=20&seed=2147483647')).toEqual({ blocks: 20, seed: 2147483647 })
  })

  it('treats headings as headers', () => {
    expect(parse('md=headings,lists').md).toEqual(['headers', 'lists'])
  })

  it('refuses a percent-encoded parameter name', () => {
    // The CDN does not decode names when it builds its cache key, so th%65me
    // was "theme" to the handler and nothing to the cache: the dog text was
    // stored for the URL without a theme.
    for (const search of ['th%65me=dog', '%74heme=dog', 'bl%6Fcks=20', 's%65ed=1', 'form%61t=html', 'm%64=headers']) {
      expect(() => parse(search)).toThrow(ApiQueryError)
    }
  })

  it('refuses unknown parameters, whatever their case', () => {
    for (const search of ['junk=1', 'Theme=dog', 'blocks=1&x=1', 'theme', '__proto__=1', 'constructor=1', '=1', 'theme[]=dog']) {
      expect(() => parse(search)).toThrow(ApiQueryError)
    }
  })

  it('refuses any parameter given twice', () => {
    for (const search of ['md=headers&md=code', 'blocks=1&blocks=2', 'lower=1&lower=1', 'nowrap=1&nowrap=1', 'theme=dog&theme=dog']) {
      expect(() => parse(search)).toThrow(/more than once/)
    }
  })

  it('refuses encoded, empty and odd values', () => {
    for (const search of ['theme=d%6Fg', 'theme=', 'seed=', 'blocks=+5', 'blocks=5%0a', 'md=headers%2Clists', 'theme=dog+', 'seed=4 2']) {
      expect(() => parse(search)).toThrow(ApiQueryError)
    }
  })

  it('refuses numbers written any other way', () => {
    for (const search of ['blocks=05', 'seed=0000000042', 'seed=1e3', 'blocks=1.0', 'seed=-6', 'blocks=0', 'blocks=21', 'seed=2147483648', 'seed=99999999999', 'blocks=abc']) {
      expect(() => parse(search)).toThrow(ApiQueryError)
    }
  })

  it('refuses unknown or repeated md values and non-1 switches', () => {
    for (const search of ['md=junk', 'md=headers,tables', 'md=headers,headers', 'md=headers,headings', 'md=,', 'md=Headers', 'lower=0', 'lower=true', 'nowrap=yes', 'nowrap=11']) {
      expect(() => parse(search)).toThrow(ApiQueryError)
    }
  })

  it('refuses unknown themes and formats', () => {
    expect(() => parse('theme=nope')).toThrow(/Invalid theme "nope"/)
    expect(() => parse('theme=toString')).toThrow(ApiQueryError)
    expect(() => parse('format=pdf')).toThrow(/Invalid format "pdf"/)
  })

  it('quotes caller input back short and printable', () => {
    const long = 'a'.repeat(500)
    let message = ''
    try {
      parse(`theme=${long}`)
    }
    catch (error) {
      message = (error as Error).message
    }
    expect(message.length).toBeLessThan(160)
    expect(() => parse('th\u0000\r\neme=1')).toThrow(/Unknown parameter "th\?\?\?eme"/)
  })

  it('ignores empty segments', () => {
    expect(parse('&blocks=2&&')).toEqual({ blocks: 2 })
  })
})

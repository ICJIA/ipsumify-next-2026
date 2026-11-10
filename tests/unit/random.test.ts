/**
 * Tests for random number generation utilities.
 *
 * @module tests/unit/random
 */
import { describe, it, expect } from 'vitest'
import { seededRandom, shuffleWithSeed, normalizeSeed, SEED_OFFSETS, SEED_PERIOD, MAX_SEED } from '../../utils/random'

describe('seededRandom', () => {
  it('should generate deterministic values for the same seed', () => {
    const rng1 = seededRandom(42)
    const rng2 = seededRandom(42)

    const values1 = Array.from({ length: 10 }, () => rng1.next())
    const values2 = Array.from({ length: 10 }, () => rng2.next())

    expect(values1).toEqual(values2)
  })

  it('should generate different values for different seeds', () => {
    const rng1 = seededRandom(42)
    const rng2 = seededRandom(43)

    const values1 = Array.from({ length: 10 }, () => rng1.next())
    const values2 = Array.from({ length: 10 }, () => rng2.next())

    expect(values1).not.toEqual(values2)
  })

  it('should generate values between 0 and 1', () => {
    const rng = seededRandom(12345)

    for (let i = 0; i < 100; i++) {
      const value = rng.next()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('should generate integers within specified range (inclusive)', () => {
    const rng = seededRandom(12345)
    const min = 1
    const max = 10

    for (let i = 0; i < 100; i++) {
      const value = rng.nextInt(min, max)
      expect(value).toBeGreaterThanOrEqual(min)
      expect(value).toBeLessThanOrEqual(max)
      expect(Number.isInteger(value)).toBe(true)
    }
  })

  it('should generate deterministic integers for the same seed', () => {
    const rng1 = seededRandom(999)
    const rng2 = seededRandom(999)

    const ints1 = Array.from({ length: 10 }, () => rng1.nextInt(1, 100))
    const ints2 = Array.from({ length: 10 }, () => rng2.nextInt(1, 100))

    expect(ints1).toEqual(ints2)
  })

  it('should handle edge case of single-value range', () => {
    const rng = seededRandom(42)
    const value = rng.nextInt(5, 5)
    expect(value).toBe(5)
  })
})

describe('shuffleWithSeed', () => {
  const testArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

  it('should shuffle deterministically for the same seed', () => {
    const shuffled1 = shuffleWithSeed(testArray, 42)
    const shuffled2 = shuffleWithSeed(testArray, 42)

    expect(shuffled1).toEqual(shuffled2)
  })

  it('should produce different shuffles for different seeds', () => {
    const shuffled1 = shuffleWithSeed(testArray, 42)
    const shuffled2 = shuffleWithSeed(testArray, 43)

    expect(shuffled1).not.toEqual(shuffled2)
  })

  it('should not mutate the original array', () => {
    const original = [...testArray]
    shuffleWithSeed(testArray, 42)

    expect(testArray).toEqual(original)
  })

  it('should contain all original elements', () => {
    const shuffled = shuffleWithSeed(testArray, 42)

    expect(shuffled).toHaveLength(testArray.length)
    expect(shuffled.sort()).toEqual([...testArray].sort())
  })

  it('should handle empty array', () => {
    const shuffled = shuffleWithSeed([], 42)
    expect(shuffled).toEqual([])
  })

  it('should handle single-element array', () => {
    const shuffled = shuffleWithSeed(['only'], 42)
    expect(shuffled).toEqual(['only'])
  })

  it('should actually shuffle (not return same order)', () => {
    // With a good seed, shuffling 10 items should almost never
    // result in the original order
    const shuffled = shuffleWithSeed(testArray, 42)
    expect(shuffled).not.toEqual(testArray)
  })
})

describe('SEED_OFFSETS', () => {
  it('should have distinct offset values', () => {
    const offsets = Object.values(SEED_OFFSETS)
    const uniqueOffsets = [...new Set(offsets)]
    expect(offsets.length).toBe(uniqueOffsets.length)
  })

  it('should have positive offset values', () => {
    Object.values(SEED_OFFSETS).forEach((offset) => {
      expect(offset).toBeGreaterThan(0)
    })
  })
})

describe('normalizeSeed', () => {
  it('leaves seeds inside the period unchanged', () => {
    expect(normalizeSeed(0)).toBe(0)
    expect(normalizeSeed(42)).toBe(42)
    expect(normalizeSeed(SEED_PERIOD - 1)).toBe(SEED_PERIOD - 1)
  })

  it('wraps larger and negative seeds into the period', () => {
    expect(normalizeSeed(SEED_PERIOD)).toBe(0)
    expect(normalizeSeed(SEED_PERIOD + 42)).toBe(42)
    expect(normalizeSeed(-1)).toBe(SEED_PERIOD - 1)
    expect(normalizeSeed(MAX_SEED)).toBe(MAX_SEED % SEED_PERIOD)
  })

  it('turns fractions and non-numbers into whole seeds', () => {
    expect(normalizeSeed(42.9)).toBe(42)
    expect(normalizeSeed(Number.NaN)).toBe(0)
    expect(normalizeSeed(Number.POSITIVE_INFINITY)).toBe(0)
  })
})

describe('negative seeds', () => {
  it('never yields a value outside 0 to 1', () => {
    const rng = seededRandom(-5000)
    for (let i = 0; i < 1000; i++) {
      const value = rng.next()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('keeps nextInt inside its bounds', () => {
    const rng = seededRandom(-5000)
    for (let i = 0; i < 1000; i++) {
      const value = rng.nextInt(1, 3)
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(3)
    }
  })

  it('shuffles without losing or inventing items', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
    for (const seed of [-1, -6, -7, -1000, -5000]) {
      expect([...shuffleWithSeed(items, seed)].sort()).toEqual(items)
    }
  })
})

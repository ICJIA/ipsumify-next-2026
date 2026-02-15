/**
 * Random number generation utilities for deterministic, SSR-safe output.
 *
 * @module utils/random
 */

/**
 * Linear Congruential Pseudo-Random Number Generator (LCPRNG) constants.
 * These values produce a full-period generator for modulus 233280.
 */
const LCPRNG_MULTIPLIER = 9301
const LCPRNG_INCREMENT = 49297
const LCPRNG_MODULUS = 233280

/**
 * Seed offsets for different random sequences.
 * Using different offsets ensures independent random streams.
 */
export const SEED_OFFSETS = {
  HEADINGS: 500,
  BLOCK_SIZES: 1000,
} as const

/**
 * Creates a seeded random number generator (LCPRNG).
 * Deterministic output for same seed - enables SSR-safe generation.
 *
 * @param seedValue - Initial seed
 * @returns Object with next() (0-1 float) and nextInt(min, max) (inclusive)
 */
export function seededRandom(seedValue: number): {
  next: () => number
  nextInt: (min: number, max: number) => number
} {
  let currentSeed = seedValue
  return {
    next: () => {
      currentSeed =
        (currentSeed * LCPRNG_MULTIPLIER + LCPRNG_INCREMENT) % LCPRNG_MODULUS
      return currentSeed / LCPRNG_MODULUS
    },
    nextInt: (min: number, max: number) => {
      currentSeed =
        (currentSeed * LCPRNG_MULTIPLIER + LCPRNG_INCREMENT) % LCPRNG_MODULUS
      return Math.floor((currentSeed / LCPRNG_MODULUS) * (max - min + 1)) + min
    },
  }
}

/**
 * Shuffles an array deterministically using a seed.
 * Fisher-Yates with seeded RNG - same seed produces same order.
 *
 * @param array - Strings to shuffle (not mutated)
 * @param seedValue - Seed for reproducible shuffle
 * @returns New shuffled array
 */
export function shuffleWithSeed(array: string[], seedValue: number): string[] {
  const shuffled = [...array]
  const rng = seededRandom(seedValue)
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    const temp = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = temp
  }
  return shuffled
}

/**
 * Random number generation utilities for deterministic, SSR-safe output.
 *
 * @module utils/random
 */

/**
 * Linear Congruential Pseudo-Random Number Generator (LCPRNG) constants.
 * These values produce a full-period generator for modulus 233280.
 */
export const LCPRNG_MULTIPLIER = 9301
export const LCPRNG_INCREMENT = 49297
const LCPRNG_MODULUS = 233280

/**
 * Largest seed the app accepts, from a share link or the API. Seeds are whole
 * numbers from 0 to this value.
 */
export const MAX_SEED = 2_147_483_647

/**
 * Brings any number into the generator's state range, 0 to LCPRNG_MODULUS - 1.
 *
 * The generator only ever works modulo LCPRNG_MODULUS, so for a whole number
 * of 0 or more this changes nothing about the sequence. It exists for the
 * values that used to break it: a negative seed left the state negative
 * (JavaScript's % keeps the sign), which sent shuffle indexes below zero, and
 * a fraction or NaN did worse.
 *
 * @param seedValue - Any number
 * @returns A whole number from 0 to LCPRNG_MODULUS - 1
 */
export function normalizeSeed(seedValue: number): number {
  if (!Number.isFinite(seedValue)) return 0
  const whole = Math.trunc(seedValue)
  return ((whole % LCPRNG_MODULUS) + LCPRNG_MODULUS) % LCPRNG_MODULUS
}

/** Number of distinct seeds before the sequence repeats. */
export const SEED_PERIOD = LCPRNG_MODULUS

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
  let currentSeed = normalizeSeed(seedValue)
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

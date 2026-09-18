/**
 * Deterministic PRNG (mulberry32). Several algorithms (Genetic Algorithm,
 * Particle Swarm Optimization, Ant Colony Optimization) rely on randomness,
 * but per CLAUDE.md determinism rules the same seed must always reproduce
 * the same run — required for reset/step-back and for tests.
 */
export function createRng(seed: number): () => number {
  let a = seed
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomInt(rng: () => number, minInclusive: number, maxExclusive: number): number {
  return minInclusive + Math.floor(rng() * (maxExclusive - minInclusive))
}

export function randomFloat(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

/** Picks an index from `weights` with probability proportional to its value. All weights must be >= 0 and sum > 0. */
export function weightedChoice(rng: () => number, weights: number[]): number {
  const total = weights.reduce((sum, w) => sum + w, 0)
  let r = rng() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}

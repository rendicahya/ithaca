/**
 * Deterministic PRNG (mulberry32). The GA relies on randomness for
 * selection/crossover/mutation, but per CLAUDE.md determinism rules the same
 * seed must always reproduce the same run — required for reset/step-back and
 * for tests.
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

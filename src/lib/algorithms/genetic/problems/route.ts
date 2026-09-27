import { randomInt } from '@/lib/random'
import type { CrossoverResult, GAProblemConfig, MutationResult } from '../types'

// A different chromosome representation from the knapsack example: genes are
// not independent 0/1 flags but a permutation of city indices, so crossover
// and mutation must preserve "every city appears exactly once" instead of
// touching genes independently.
export interface City {
  x: number
  y: number
}

export const ROUTE_CITIES: City[] = [
  { x: 0, y: 0 },
  { x: 4, y: 1 },
  { x: 6, y: 5 },
  { x: 3, y: 6 },
  { x: -1, y: 4 },
  { x: 2, y: 2 },
]

function distance(a: City, b: City): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function tourDistance(genes: number[]): number {
  let total = 0
  for (let i = 0; i < genes.length; i++) {
    const from = ROUTE_CITIES[genes[i]]
    const to = ROUTE_CITIES[genes[(i + 1) % genes.length]]
    total += distance(from, to)
  }
  return total
}

const CHROMOSOME_LENGTH = ROUTE_CITIES.length
const POPULATION_SIZE = 6
const MAX_GENERATIONS = 3
const CROSSOVER_RATE = 0.9
const MUTATION_RATE = 0.3
const SEED = 5

// Larger than any possible tour distance for these coordinates, so fitness
// (which the algorithm maximizes) is always positive and shorter tours score
// higher — the algorithm never sees "distance" directly, only "fitness".
export const SCALE = 40

/** Rounded so equal-length tours compare as equal fitness despite floating-point distance sums. */
export function routeFitness(genes: number[]): number {
  return Math.round((SCALE - tourDistance(genes)) * 10) / 10
}

function bruteForceBestFitness(): number {
  const n = CHROMOSOME_LENGTH
  const rest = Array.from({ length: n - 1 }, (_, i) => i + 1)
  let best = -Infinity

  function permute(prefix: number[], remaining: number[]): void {
    if (remaining.length === 0) {
      best = Math.max(best, routeFitness(prefix))
      return
    }
    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i]
      permute([...prefix, next], [...remaining.slice(0, i), ...remaining.slice(i + 1)])
    }
  }

  // City 0 is fixed as the first stop — a cyclic tour has no distinguished
  // start, so this only removes rotational duplicates, not real solutions.
  permute([0], rest)
  return best
}

export function routeDecode(genes: number[]): { order: number[]; distance: number } {
  return { order: genes, distance: tourDistance(genes) }
}

function shuffledPermutation(rng: () => number): number[] {
  const genes = Array.from({ length: CHROMOSOME_LENGTH }, (_, i) => i)
  for (let i = genes.length - 1; i > 0; i--) {
    const j = randomInt(rng, 0, i + 1)
    ;[genes[i], genes[j]] = [genes[j], genes[i]]
  }
  return genes
}

/** Order crossover (OX1): copy a segment from one parent verbatim, then fill the remaining positions with the other parent's cities in their existing order, skipping cities already placed. This is what keeps the child a valid permutation. */
function orderCrossover(rng: () => number, a: number[], b: number[]): CrossoverResult {
  const n = a.length
  let i = randomInt(rng, 0, n)
  let j = randomInt(rng, 0, n)
  if (i === j) j = (j + 1) % n
  const from = Math.min(i, j)
  const to = Math.max(i, j) + 1

  function buildChild(segmentSource: number[], fillSource: number[]): number[] {
    const child: Array<number | null> = new Array(n).fill(null)
    for (let k = from; k < to; k++) child[k] = segmentSource[k]
    const used = new Set(child.filter((v): v is number => v !== null))
    let fillIndex = 0
    for (let k = 0; k < n; k++) {
      if (child[k] !== null) continue
      while (used.has(fillSource[fillIndex])) fillIndex++
      child[k] = fillSource[fillIndex]
      used.add(fillSource[fillIndex])
      fillIndex++
    }
    return child as number[]
  }

  return {
    childA: buildChild(a, b),
    childB: buildChild(b, a),
    kind: 'segment',
    points: [from, to],
  }
}

/** Swap mutation: exchanges two positions outright, since flipping one gene in isolation (as bit-flip mutation does) would produce a repeated city and an invalid tour. */
function swapMutate(rng: () => number, genes: number[]): MutationResult {
  if (rng() >= MUTATION_RATE) return { genes: [...genes], mutatedIndices: [] }
  const n = genes.length
  const i = randomInt(rng, 0, n)
  let j = randomInt(rng, 0, n)
  while (j === i) j = randomInt(rng, 0, n)
  const result = [...genes]
  ;[result[i], result[j]] = [result[j], result[i]]
  return { genes: result, mutatedIndices: [i, j] }
}

export const routeConfig: GAProblemConfig = {
  id: 'route',
  chromosomeLength: CHROMOSOME_LENGTH,
  populationSize: POPULATION_SIZE,
  maxGenerations: MAX_GENERATIONS,
  crossoverRate: CROSSOVER_RATE,
  mutationRate: MUTATION_RATE,
  mutationKind: 'swap',
  seed: SEED,
  maxFitness: bruteForceBestFitness(),
  randomGenes: shuffledPermutation,
  fitnessOf: routeFitness,
  crossover: orderCrossover,
  mutate: swapMutate,
}

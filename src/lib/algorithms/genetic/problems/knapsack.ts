import { randomInt } from '@/lib/random'
import type { CrossoverResult, GAProblemConfig, MutationResult } from '../types'

// Fixed teaching configuration — deliberately chosen and not user-configurable,
// the same way the default search graphs are fixed, so a lecturer always gets
// the same run to explain.
export interface KnapsackItem {
  weight: number
  value: number
}

export const KNAPSACK_ITEMS: KnapsackItem[] = [
  { weight: 4, value: 7 },
  { weight: 3, value: 5 },
  { weight: 1, value: 3 },
  { weight: 2, value: 4 },
  { weight: 2, value: 6 },
  { weight: 3, value: 4 },
  { weight: 5, value: 8 },
  { weight: 4, value: 6 },
]

export const KNAPSACK_CAPACITY = 12

function knapsackValue(genes: number[]): { weight: number; value: number } {
  let weight = 0
  let value = 0
  for (let i = 0; i < genes.length; i++) {
    if (genes[i] === 1) {
      weight += KNAPSACK_ITEMS[i].weight
      value += KNAPSACK_ITEMS[i].value
    }
  }
  return { weight, value }
}

/** A chromosome that packs more weight than the knapsack can carry is an invalid solution, not merely a low-scoring one. */
export function knapsackFitness(genes: number[]): number {
  const { weight, value } = knapsackValue(genes)
  return weight <= KNAPSACK_CAPACITY ? value : 0
}

function bruteForceOptimalValue(): number {
  let best = 0
  const n = KNAPSACK_ITEMS.length
  for (let mask = 0; mask < 1 << n; mask++) {
    const genes = Array.from({ length: n }, (_, i) => (mask >> i) & 1)
    best = Math.max(best, knapsackFitness(genes))
  }
  return best
}

export function knapsackDecode(genes: number[]): {
  includedIndices: number[]
  weight: number
  value: number
} {
  const { weight, value } = knapsackValue(genes)
  const includedIndices = genes.flatMap((g, i) => (g === 1 ? [i] : []))
  return { includedIndices, weight, value }
}

const CHROMOSOME_LENGTH = KNAPSACK_ITEMS.length
const POPULATION_SIZE = 6
const MAX_GENERATIONS = 8
const CROSSOVER_RATE = 0.9
const MUTATION_RATE = 0.1
const SEED = 11

function crossover(rng: () => number, a: number[], b: number[]): CrossoverResult {
  const point = randomInt(rng, 1, a.length)
  return {
    childA: [...a.slice(0, point), ...b.slice(point)],
    childB: [...b.slice(0, point), ...a.slice(point)],
    kind: 'point',
    points: [point],
  }
}

function mutate(rng: () => number, genes: number[]): MutationResult {
  const result = [...genes]
  const mutatedIndices: number[] = []
  for (let i = 0; i < result.length; i++) {
    if (rng() < MUTATION_RATE) {
      result[i] = result[i] === 0 ? 1 : 0
      mutatedIndices.push(i)
    }
  }
  return { genes: result, mutatedIndices }
}

export const knapsackConfig: GAProblemConfig = {
  id: 'knapsack',
  chromosomeLength: CHROMOSOME_LENGTH,
  populationSize: POPULATION_SIZE,
  maxGenerations: MAX_GENERATIONS,
  crossoverRate: CROSSOVER_RATE,
  mutationRate: MUTATION_RATE,
  mutationKind: 'flip',
  seed: SEED,
  targetFitness: bruteForceOptimalValue(),
  maxFitness: bruteForceOptimalValue(),
  randomGenes: (rng) => Array.from({ length: CHROMOSOME_LENGTH }, () => (rng() < 0.5 ? 0 : 1)),
  fitnessOf: knapsackFitness,
  crossover,
  mutate,
}

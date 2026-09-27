import type { Message } from '@/lib/i18n/translate'

export type GAExampleId = 'knapsack' | 'route'

/** How offspring are produced from two parents. 'none' means the crossover roll failed and the offspring are exact copies. */
export type CrossoverKind = 'point' | 'segment' | 'none'

/** How a single offspring's genes are perturbed. Binary chromosomes flip bits; permutation chromosomes swap two positions instead, since flipping a single gene would break the permutation. */
export type MutationKind = 'flip' | 'swap'

export interface Chromosome {
  id: string
  genes: number[]
  fitness: number
  /** Whether this chromosome has gone through an "evaluate fitness" step yet. Freshly created (unevaluated) chromosomes hide their fitness in the UI so it never appears before the algorithm has actually computed it. */
  evaluated: boolean
}

export interface GAState {
  exampleId: GAExampleId
  generation: number
  maxGenerations: number
  chromosomeLength: number
  targetFitness: number
  maxFitness: number
  crossoverRate: number
  mutationRate: number
  population: Chromosome[]
  newPopulation: Chromosome[]
  /** The two chromosomes chosen by tournament selection to become parents. */
  parentA: Chromosome | null
  parentB: Chromosome | null
  tournamentCandidatesA: Chromosome[]
  tournamentCandidatesB: Chromosome[]
  crossoverKind: CrossoverKind | null
  /** [point] for single-point crossover, [from, to) for segment/order crossover, empty when crossover did not happen. */
  crossoverPoints: number[]
  offspring: [Chromosome, Chromosome] | null
  /** Gene indices touched by mutation, one array per offspring. */
  mutatedIndices: [number[], number[]]
  bestChromosome: Chromosome | null
  bestFitnessEver: number
  done: boolean
  found: boolean
}

export interface GAStep {
  state: GAState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
}

export function cloneChromosome(c: Chromosome): Chromosome {
  return { id: c.id, genes: [...c.genes], fitness: c.fitness, evaluated: c.evaluated }
}

export function cloneState(state: GAState): GAState {
  return {
    ...state,
    population: state.population.map(cloneChromosome),
    newPopulation: state.newPopulation.map(cloneChromosome),
    parentA: state.parentA ? cloneChromosome(state.parentA) : null,
    parentB: state.parentB ? cloneChromosome(state.parentB) : null,
    tournamentCandidatesA: state.tournamentCandidatesA.map(cloneChromosome),
    tournamentCandidatesB: state.tournamentCandidatesB.map(cloneChromosome),
    crossoverPoints: [...state.crossoverPoints],
    offspring: state.offspring
      ? [cloneChromosome(state.offspring[0]), cloneChromosome(state.offspring[1])]
      : null,
    mutatedIndices: [[...state.mutatedIndices[0]], [...state.mutatedIndices[1]]],
    bestChromosome: state.bestChromosome ? cloneChromosome(state.bestChromosome) : null,
  }
}

export function genesToString(genes: number[]): string {
  return genes.join('')
}

export interface CrossoverResult {
  childA: number[]
  childB: number[]
  kind: 'point' | 'segment'
  /** [point] for 'point', [from, to) for 'segment'. */
  points: number[]
}

export interface MutationResult {
  genes: number[]
  mutatedIndices: number[]
}

export interface GAProblemConfig {
  id: GAExampleId
  chromosomeLength: number
  populationSize: number
  maxGenerations: number
  crossoverRate: number
  mutationRate: number
  mutationKind: MutationKind
  seed: number
  targetFitness: number
  maxFitness: number
  randomGenes: (rng: () => number) => number[]
  fitnessOf: (genes: number[]) => number
  crossover: (rng: () => number, a: number[], b: number[]) => CrossoverResult
  mutate: (rng: () => number, genes: number[]) => MutationResult
}

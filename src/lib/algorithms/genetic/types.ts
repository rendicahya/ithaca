import type { Message } from '@/lib/i18n/translate'

export interface Chromosome {
  id: string
  genes: number[]
  fitness: number
}

export interface GAState {
  generation: number
  maxGenerations: number
  chromosomeLength: number
  targetFitness: number
  population: Chromosome[]
  newPopulation: Chromosome[]
  /** The two chromosomes chosen by tournament selection to become parents. */
  parentA: Chromosome | null
  parentB: Chromosome | null
  tournamentCandidatesA: Chromosome[]
  tournamentCandidatesB: Chromosome[]
  /** Gene index where single-point crossover splits the two parents. */
  crossoverPoint: number | null
  offspring: [Chromosome, Chromosome] | null
  /** Gene indices flipped by mutation, one array per offspring. */
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
  return { id: c.id, genes: [...c.genes], fitness: c.fitness }
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

export function fitnessOf(genes: number[]): number {
  return genes.reduce((sum, g) => sum + g, 0)
}

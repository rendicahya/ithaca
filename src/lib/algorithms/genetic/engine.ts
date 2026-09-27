import { msg } from '@/lib/i18n/translate'

import { createRng, randomInt } from '@/lib/random'
import { cloneChromosome, cloneState, genesToString } from './types'
import type { Chromosome, GAProblemConfig, GAState, GAStep } from './types'

// Shared across every GA example — the operations (select, crossover, mutate)
// are named abstractly on purpose so the same pseudocode explains both a
// binary-chromosome problem and a permutation-chromosome one. The selection
// mechanism itself (roulette wheel, tournament, ...) is covered separately,
// on the Selection Methods page. There is no fitness target: the only
// stopping condition is the generation budget, so every run evolves for
// exactly maxGenerations generations and reports whatever it found.
export const geneticPseudocode = [
  'initialize population P randomly',
  'evaluate fitness of each individual in P',
  'while generation < maxGenerations',
  '    newPopulation ← empty',
  '    while newPopulation is not full',
  '        parentA, parentB ← select(P) — two distinct individuals',
  '        with probability crossoverRate: offspringA, offspringB ← crossover(parentA, parentB)',
  '        with probability mutationRate: mutate(offspringA); mutate(offspringB)',
  '        add offspringA, offspringB to newPopulation',
  '    P ← newPopulation',
  '    generation ← generation + 1',
  '    evaluate fitness of each individual in P',
  'return best individual found',
]

function clearTransient(state: GAState): void {
  state.parentA = null
  state.parentB = null
  state.tournamentCandidatesA = []
  state.tournamentCandidatesB = []
  state.crossoverKind = null
  state.crossoverPoints = []
  state.offspring = null
  state.mutatedIndices = [[], []]
}

export function runGA(config: GAProblemConfig): GAStep[] {
  const steps: GAStep[] = []
  const rng = createRng(config.seed)

  function randomChromosome(id: string): Chromosome {
    const genes = config.randomGenes(rng)
    return { id, genes, fitness: config.fitnessOf(genes), evaluated: false }
  }

  function tournamentSelect(population: Chromosome[]): {
    winner: Chromosome
    candidates: Chromosome[]
  } {
    const i = randomInt(rng, 0, population.length)
    let j = randomInt(rng, 0, population.length)
    if (population.length > 1) {
      while (j === i) j = randomInt(rng, 0, population.length)
    }
    const a = population[i]
    const b = population[j]
    const winner = a.fitness >= b.fitness ? a : b
    return { winner, candidates: [a, b] }
  }

  /** Runs two tournaments, re-running the second if it happens to pick the same winner as the first — a chromosome should never be crossed over with itself. */
  function selectDistinctParents(population: Chromosome[]): {
    a: { winner: Chromosome; candidates: Chromosome[] }
    b: { winner: Chromosome; candidates: Chromosome[] }
  } {
    const a = tournamentSelect(population)
    let b = tournamentSelect(population)
    let guard = 0
    while (b.winner.id === a.winner.id && guard < 50) {
      b = tournamentSelect(population)
      guard++
    }
    return { a, b }
  }

  const population = Array.from({ length: config.populationSize }, (_, i) =>
    randomChromosome(`C${i + 1}`),
  )

  const state: GAState = {
    exampleId: config.id,
    generation: 1,
    maxGenerations: config.maxGenerations,
    chromosomeLength: config.chromosomeLength,
    maxFitness: config.maxFitness,
    crossoverRate: config.crossoverRate,
    mutationRate: config.mutationRate,
    population,
    newPopulation: [],
    parentA: null,
    parentB: null,
    tournamentCandidatesA: [],
    tournamentCandidatesB: [],
    crossoverKind: null,
    crossoverPoints: [],
    offspring: null,
    mutatedIndices: [[], []],
    bestChromosome: null,
    bestFitnessEver: -Infinity,
    done: false,
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 1,
    explanation: msg('genetic.init', {
      size: config.populationSize,
      length: config.chromosomeLength,
    }),
    traceEntry: msg('genetic.init.trace', { size: config.populationSize }),
  })

  function pushEvaluate(evalLine: number): void {
    state.population = state.population.map((c) => ({
      ...c,
      fitness: config.fitnessOf(c.genes),
      evaluated: true,
    }))
    const genBest = state.population.reduce((best, c) => (c.fitness > best.fitness ? c : best))
    if (state.bestChromosome === null || genBest.fitness > state.bestFitnessEver) {
      state.bestChromosome = cloneChromosome(genBest)
      state.bestFitnessEver = genBest.fitness
    }

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: evalLine,
      explanation: msg('genetic.evaluate', {
        gen: state.generation,
        best: genBest.id,
        fitness: genBest.fitness,
      }),
      traceEntry: msg('genetic.evaluate.trace', { gen: state.generation, fitness: genBest.fitness }),
    })
  }

  pushEvaluate(2)

  while (state.generation < config.maxGenerations) {
    clearTransient(state)
    state.newPopulation = []

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 4,
      explanation: msg('genetic.newPopulationStart', { gen: state.generation }),
      traceEntry: msg('genetic.newPopulationStart.trace', { gen: state.generation }),
    })

    const pairs = config.populationSize / 2
    for (let p = 0; p < pairs; p++) {
      const sel = selectDistinctParents(state.population)
      state.parentA = cloneChromosome(sel.a.winner)
      state.parentB = cloneChromosome(sel.b.winner)
      state.tournamentCandidatesA = sel.a.candidates.map(cloneChromosome)
      state.tournamentCandidatesB = sel.b.candidates.map(cloneChromosome)
      state.crossoverKind = null
      state.crossoverPoints = []
      state.offspring = null
      state.mutatedIndices = [[], []]

      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 6,
        explanation: msg('genetic.selectParents', {
          a: state.parentA.id,
          fitnessA: state.parentA.fitness,
          b: state.parentB.id,
          fitnessB: state.parentB.fitness,
        }),
        traceEntry: msg('genetic.selectParents.trace', {
          a: state.parentA.id,
          b: state.parentB.id,
        }),
      })

      const doCrossover = rng() < config.crossoverRate
      let childAGenes: number[]
      let childBGenes: number[]
      if (doCrossover) {
        const result = config.crossover(rng, state.parentA.genes, state.parentB.genes)
        childAGenes = result.childA
        childBGenes = result.childB
        state.crossoverKind = result.kind
        state.crossoverPoints = result.points
      } else {
        childAGenes = [...state.parentA.genes]
        childBGenes = [...state.parentB.genes]
        state.crossoverKind = 'none'
        state.crossoverPoints = []
      }

      const offspringBaseIndex = state.newPopulation.length
      const offspringA: Chromosome = {
        id: `C${offspringBaseIndex + 1}`,
        genes: childAGenes,
        fitness: config.fitnessOf(childAGenes),
        evaluated: false,
      }
      const offspringB: Chromosome = {
        id: `C${offspringBaseIndex + 2}`,
        genes: childBGenes,
        fitness: config.fitnessOf(childBGenes),
        evaluated: false,
      }
      state.offspring = [offspringA, offspringB]

      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 7,
        explanation: !doCrossover
          ? msg('genetic.crossover.skipped', { a: state.parentA.id, b: state.parentB.id })
          : state.crossoverKind === 'point'
            ? msg('genetic.crossover.point', {
                a: state.parentA.id,
                b: state.parentB.id,
                point: state.crossoverPoints[0],
              })
            : msg('genetic.crossover.segment', {
                a: state.parentA.id,
                b: state.parentB.id,
                from: state.crossoverPoints[0],
                to: state.crossoverPoints[1],
              }),
        traceEntry: doCrossover
          ? msg('genetic.crossover.trace', { a: state.parentA.id, b: state.parentB.id })
          : msg('genetic.crossover.skipped.trace'),
      })

      const mutA = config.mutate(rng, offspringA.genes)
      const mutB = config.mutate(rng, offspringB.genes)
      offspringA.genes = mutA.genes
      offspringB.genes = mutB.genes
      offspringA.fitness = config.fitnessOf(offspringA.genes)
      offspringB.fitness = config.fitnessOf(offspringB.genes)
      state.mutatedIndices = [mutA.mutatedIndices, mutB.mutatedIndices]

      const anyMutation = mutA.mutatedIndices.length > 0 || mutB.mutatedIndices.length > 0
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 8,
        explanation: !anyMutation
          ? msg('genetic.mutate.none', { a: offspringA.id, b: offspringB.id })
          : config.mutationKind === 'swap'
            ? msg('genetic.mutate.swap', { a: offspringA.id, b: offspringB.id })
            : msg('genetic.mutate.some', {
                a: offspringA.id,
                countA: mutA.mutatedIndices.length,
                b: offspringB.id,
                countB: mutB.mutatedIndices.length,
              }),
        traceEntry: anyMutation
          ? msg('genetic.mutate.trace.some', {
              count: mutA.mutatedIndices.length + mutB.mutatedIndices.length,
            })
          : msg('genetic.mutate.trace.none'),
      })

      state.newPopulation = [
        ...state.newPopulation,
        cloneChromosome(offspringA),
        cloneChromosome(offspringB),
      ]
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 9,
        explanation: msg('genetic.addOffspring', {
          a: offspringA.id,
          b: offspringB.id,
          count: state.newPopulation.length,
          size: config.populationSize,
        }),
        traceEntry: msg('genetic.addOffspring.trace', { a: offspringA.id, b: offspringB.id }),
      })
    }

    state.population = state.newPopulation.map(cloneChromosome)
    clearTransient(state)
    state.newPopulation = []
    state.generation += 1

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 11,
      explanation: msg('genetic.newGeneration', { gen: state.generation }),
      traceEntry: msg('genetic.newGeneration.trace', { gen: state.generation }),
    })

    pushEvaluate(12)
  }

  state.done = true
  const best = state.bestChromosome as Chromosome
  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 13,
    explanation: msg('genetic.generationsExhausted', {
      chromosome: best.id,
      genes: genesToString(best.genes),
      fitness: state.bestFitnessEver,
      gen: state.generation,
    }),
    traceEntry: msg('genetic.generationsExhausted.trace', { fitness: state.bestFitnessEver }),
  })

  return steps
}

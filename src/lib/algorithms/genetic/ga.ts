import { msg } from '@/lib/i18n/translate'

import { createRng, randomInt } from '@/lib/random'
import { cloneChromosome, cloneState, fitnessOf, genesToString } from './types'
import type { Chromosome, GAState, GAStep } from './types'

export const geneticPseudocode = [
  'initialize population P randomly',
  'evaluate fitness of each individual in P',
  'if best fitness in P equals target',
  '    return best individual (solution found)',
  'while generation < maxGenerations',
  '    newPopulation ← empty',
  '    while newPopulation is not full',
  '        parentA, parentB ← tournament-select(P)',
  '        offspringA, offspringB ← crossover(parentA, parentB)',
  '        mutate(offspringA); mutate(offspringB)',
  '        add offspringA, offspringB to newPopulation',
  '    P ← newPopulation',
  '    generation ← generation + 1',
  '    evaluate fitness of each individual in P',
  '    if best fitness in P equals target',
  '        return best individual (solution found)',
  'return best individual found (generations exhausted)',
]

// Fixed teaching configuration — deliberately chosen and not user-configurable,
// the same way the default search graphs are fixed, so a lecturer always gets
// the same run to explain.
const CHROMOSOME_LENGTH = 8
const POPULATION_SIZE = 6
const MAX_GENERATIONS = 6
const MUTATION_RATE = 0.1
const SEED = 42

function emptyTransientState(): Pick<
  GAState,
  | 'newPopulation'
  | 'parentA'
  | 'parentB'
  | 'tournamentCandidatesA'
  | 'tournamentCandidatesB'
  | 'crossoverPoint'
  | 'offspring'
  | 'mutatedIndices'
> {
  return {
    newPopulation: [],
    parentA: null,
    parentB: null,
    tournamentCandidatesA: [],
    tournamentCandidatesB: [],
    crossoverPoint: null,
    offspring: null,
    mutatedIndices: [[], []],
  }
}

export function runGeneticAlgorithm(): GAStep[] {
  const steps: GAStep[] = []
  const rng = createRng(SEED)
  const targetFitness = CHROMOSOME_LENGTH

  function randomChromosome(id: string): Chromosome {
    const genes = Array.from({ length: CHROMOSOME_LENGTH }, () => (rng() < 0.5 ? 0 : 1))
    return { id, genes, fitness: fitnessOf(genes) }
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

  const population = Array.from({ length: POPULATION_SIZE }, (_, i) =>
    randomChromosome(`C${i + 1}`),
  )
  const initialBest = population.reduce((best, c) => (c.fitness > best.fitness ? c : best))

  const state: GAState = {
    generation: 1,
    maxGenerations: MAX_GENERATIONS,
    chromosomeLength: CHROMOSOME_LENGTH,
    targetFitness,
    population,
    bestChromosome: cloneChromosome(initialBest),
    bestFitnessEver: initialBest.fitness,
    done: false,
    found: false,
    ...emptyTransientState(),
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 1,
    explanation: msg('genetic.init', {
      size: POPULATION_SIZE,
      length: CHROMOSOME_LENGTH,
    }),
    traceEntry: msg('genetic.init.trace', { size: POPULATION_SIZE }),
  })

  function pushEvaluateAndCheck(evalLine: number, checkLine: number, returnLine: number): boolean {
    state.population = state.population.map((c) => ({ ...c, fitness: fitnessOf(c.genes) }))
    const genBest = state.population.reduce((best, c) => (c.fitness > best.fitness ? c : best))
    if (genBest.fitness > state.bestFitnessEver) {
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

    const solved = genBest.fitness >= state.targetFitness
    steps.push({
      state: cloneState(state),
      activePseudocodeLine: checkLine,
      explanation: solved
        ? msg('genetic.checkGoal.found', { chromosome: genBest.id, fitness: genBest.fitness })
        : msg('genetic.checkGoal.notFound', { best: genBest.fitness, target: state.targetFitness }),
      traceEntry: solved
        ? msg('genetic.checkGoal.found.trace', { chromosome: genBest.id })
        : msg('genetic.checkGoal.notFound.trace', { fitness: genBest.fitness }),
    })

    if (solved) {
      state.done = true
      state.found = true
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: returnLine,
        explanation: msg('genetic.solutionFound', {
          chromosome: genBest.id,
          genes: genesToString(genBest.genes),
          fitness: genBest.fitness,
        }),
        traceEntry: msg('genetic.solutionFound.trace', { chromosome: genBest.id }),
      })
    }
    return solved
  }

  if (pushEvaluateAndCheck(2, 3, 4)) return steps

  while (state.generation <= MAX_GENERATIONS && !state.done) {
    Object.assign(state, emptyTransientState())

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 6,
      explanation: msg('genetic.newPopulationStart', { gen: state.generation }),
      traceEntry: msg('genetic.newPopulationStart.trace', { gen: state.generation }),
    })

    const pairs = POPULATION_SIZE / 2
    for (let p = 0; p < pairs; p++) {
      const selA = tournamentSelect(state.population)
      const selB = tournamentSelect(state.population)
      state.parentA = cloneChromosome(selA.winner)
      state.parentB = cloneChromosome(selB.winner)
      state.tournamentCandidatesA = selA.candidates.map(cloneChromosome)
      state.tournamentCandidatesB = selB.candidates.map(cloneChromosome)
      state.crossoverPoint = null
      state.offspring = null
      state.mutatedIndices = [[], []]

      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 8,
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

      const point = randomInt(rng, 1, CHROMOSOME_LENGTH)
      state.crossoverPoint = point
      const childAGenes = [
        ...state.parentA.genes.slice(0, point),
        ...state.parentB.genes.slice(point),
      ]
      const childBGenes = [
        ...state.parentB.genes.slice(0, point),
        ...state.parentA.genes.slice(point),
      ]
      const offspringA: Chromosome = {
        id: `C${state.newPopulation.length + 1}`,
        genes: childAGenes,
        fitness: fitnessOf(childAGenes),
      }
      const offspringB: Chromosome = {
        id: `C${state.newPopulation.length + 2}`,
        genes: childBGenes,
        fitness: fitnessOf(childBGenes),
      }
      state.offspring = [offspringA, offspringB]

      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 9,
        explanation: msg('genetic.crossover', {
          a: state.parentA.id,
          b: state.parentB.id,
          point,
        }),
        traceEntry: msg('genetic.crossover.trace', { point }),
      })

      const mutatedA: number[] = []
      const mutatedB: number[] = []
      for (let i = 0; i < CHROMOSOME_LENGTH; i++) {
        if (rng() < MUTATION_RATE) {
          offspringA.genes[i] = offspringA.genes[i] === 0 ? 1 : 0
          mutatedA.push(i)
        }
        if (rng() < MUTATION_RATE) {
          offspringB.genes[i] = offspringB.genes[i] === 0 ? 1 : 0
          mutatedB.push(i)
        }
      }
      offspringA.fitness = fitnessOf(offspringA.genes)
      offspringB.fitness = fitnessOf(offspringB.genes)
      state.mutatedIndices = [mutatedA, mutatedB]

      const anyMutation = mutatedA.length > 0 || mutatedB.length > 0
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 10,
        explanation: anyMutation
          ? msg('genetic.mutate.some', {
              a: offspringA.id,
              countA: mutatedA.length,
              b: offspringB.id,
              countB: mutatedB.length,
            })
          : msg('genetic.mutate.none', { a: offspringA.id, b: offspringB.id }),
        traceEntry: anyMutation
          ? msg('genetic.mutate.trace.some', { count: mutatedA.length + mutatedB.length })
          : msg('genetic.mutate.trace.none'),
      })

      state.newPopulation = [
        ...state.newPopulation,
        cloneChromosome(offspringA),
        cloneChromosome(offspringB),
      ]
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 11,
        explanation: msg('genetic.addOffspring', {
          a: offspringA.id,
          b: offspringB.id,
          count: state.newPopulation.length,
          size: POPULATION_SIZE,
        }),
        traceEntry: msg('genetic.addOffspring.trace', { a: offspringA.id, b: offspringB.id }),
      })
    }

    state.population = state.newPopulation.map(cloneChromosome)
    Object.assign(state, emptyTransientState())
    state.generation += 1

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 12,
      explanation: msg('genetic.newGeneration', { gen: state.generation }),
      traceEntry: msg('genetic.newGeneration.trace', { gen: state.generation }),
    })

    if (pushEvaluateAndCheck(14, 15, 16)) return steps
  }

  state.done = true
  state.found = false
  const best = state.bestChromosome as Chromosome
  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 17,
    explanation: msg('genetic.generationsExhausted', {
      chromosome: best.id,
      genes: genesToString(best.genes),
      fitness: state.bestFitnessEver,
      target: targetFitness,
    }),
    traceEntry: msg('genetic.generationsExhausted.trace', { fitness: state.bestFitnessEver }),
  })

  return steps
}

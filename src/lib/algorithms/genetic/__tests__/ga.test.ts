import { describe, expect, it } from 'vitest'

import { geneticPseudocode, runGeneticAlgorithm } from '../ga'
import { KNAPSACK_CAPACITY, KNAPSACK_ITEMS, knapsackFitness } from '../problems/knapsack'
import { tourDistance } from '../problems/route'

describe.each([{ id: 'knapsack' as const }, { id: 'route' as const }])(
  'runGeneticAlgorithm(%s)',
  ({ id }) => {
    const steps = runGeneticAlgorithm(id)
    const last = steps[steps.length - 1]

    it('terminates', () => {
      expect(last.state.done).toBe(true)
    })

    it('always runs for the full generation budget (no fitness-target early stop)', () => {
      expect(last.state.generation).toBe(last.state.maxGenerations)
    })

    it('never picks the same individual as both parents', () => {
      for (const step of steps) {
        if (step.state.parentA && step.state.parentB) {
          expect(step.state.parentA.id).not.toBe(step.state.parentB.id)
        }
      }
    })

    it('keeps population size constant at every step where a population exists', () => {
      for (const step of steps) {
        if (step.state.population.length > 0) {
          expect(step.state.population.length).toBe(6)
        }
      }
    })

    it('hides fitness until a chromosome has actually been evaluated', () => {
      for (const step of steps) {
        for (const c of step.state.population) {
          if (!c.evaluated) continue
          expect(Number.isFinite(c.fitness)).toBe(true)
        }
      }
      // the very first step is the freshly initialized, unevaluated population
      expect(steps[0].state.population.every((c) => !c.evaluated)).toBe(true)
    })

    it('records a generationsExhausted step as the very last step', () => {
      expect(last.traceEntry?.key).toBe('genetic.generationsExhausted.trace')
    })

    it('every step references a valid pseudocode line', () => {
      for (const step of steps) {
        expect(step.activePseudocodeLine).toBeGreaterThanOrEqual(1)
        expect(step.activePseudocodeLine).toBeLessThanOrEqual(geneticPseudocode.length)
      }
    })

    it('produces an identical run every time given the fixed seed', () => {
      const again = runGeneticAlgorithm(id)
      expect(again.length).toBe(steps.length)
      expect(again[again.length - 1].state.bestChromosome?.genes).toEqual(
        last.state.bestChromosome?.genes,
      )
    })
  },
)

describe('knapsack problem', () => {
  it('scores zero for a packing list over capacity', () => {
    const allOnes = KNAPSACK_ITEMS.map(() => 1)
    const totalWeight = KNAPSACK_ITEMS.reduce((sum, item) => sum + item.weight, 0)
    expect(totalWeight).toBeGreaterThan(KNAPSACK_CAPACITY)
    expect(knapsackFitness(allOnes)).toBe(0)
  })

  it('is not merely the count of 1-genes — fitness depends on which items are chosen', () => {
    const genes = KNAPSACK_ITEMS.map((_, i) => (i === 0 ? 1 : 0))
    const sameCount = KNAPSACK_ITEMS.map((_, i) => (i === 1 ? 1 : 0))
    const geneSum = genes.reduce<number>((s, g) => s + g, 0)
    expect(knapsackFitness(genes)).not.toBe(geneSum)
    expect(knapsackFitness(genes)).not.toBe(knapsackFitness(sameCount))
  })
})

describe('route problem', () => {
  it('a tour of all cities visits every city exactly once', () => {
    const steps = runGeneticAlgorithm('route')
    for (const step of steps) {
      for (const c of step.state.population) {
        const sorted = [...c.genes].sort((a, b) => a - b)
        expect(sorted).toEqual(sorted.map((_, i) => i))
      }
    }
  })

  it('fitness is derived from tour distance, not gene values', () => {
    const genes = [0, 1, 2, 3, 4, 5]
    const shuffled = [0, 2, 4, 1, 3, 5]
    expect(tourDistance(genes)).not.toBe(0)
    expect(tourDistance(shuffled)).not.toBe(tourDistance(genes))
  })
})

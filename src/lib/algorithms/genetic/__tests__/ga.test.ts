import { describe, expect, it } from 'vitest'

import { geneticPseudocode, runGeneticAlgorithm } from '../ga'

describe('runGeneticAlgorithm', () => {
  const steps = runGeneticAlgorithm()
  const last = steps[steps.length - 1]

  it('terminates', () => {
    expect(last.state.done).toBe(true)
  })

  it('finds the optimal all-ones chromosome within the generation budget', () => {
    expect(last.state.found).toBe(true)
    expect(last.state.bestFitnessEver).toBe(last.state.chromosomeLength)
    expect(last.state.bestChromosome?.genes.every((g) => g === 1)).toBe(true)
  })

  it('never exceeds the configured maximum number of generations', () => {
    expect(last.state.generation).toBeLessThanOrEqual(last.state.maxGenerations)
  })

  it('keeps population size constant at every step where a population exists', () => {
    for (const step of steps) {
      if (step.state.population.length > 0) {
        expect(step.state.population.length).toBe(6)
      }
    }
  })

  it('always splits crossover strictly inside the chromosome', () => {
    for (const step of steps) {
      if (step.state.crossoverPoint !== null) {
        expect(step.state.crossoverPoint).toBeGreaterThanOrEqual(1)
        expect(step.state.crossoverPoint).toBeLessThan(step.state.chromosomeLength)
      }
    }
  })

  it('applies mutation at least once across the run', () => {
    const mutated = steps.some(
      (s) => s.state.mutatedIndices[0].length > 0 || s.state.mutatedIndices[1].length > 0,
    )
    expect(mutated).toBe(true)
  })

  it('records a solutionFound step as the very last step', () => {
    expect(last.traceEntry?.key).toBe('genetic.solutionFound.trace')
  })

  it('every step references a valid pseudocode line', () => {
    for (const step of steps) {
      expect(step.activePseudocodeLine).toBeGreaterThanOrEqual(1)
      expect(step.activePseudocodeLine).toBeLessThanOrEqual(geneticPseudocode.length)
    }
  })
})

describe('runGeneticAlgorithm — determinism', () => {
  it('produces an identical run every time given the fixed seed', () => {
    const a = runGeneticAlgorithm()
    const b = runGeneticAlgorithm()
    expect(a.length).toBe(b.length)
    expect(a[a.length - 1].state.bestChromosome?.genes).toEqual(
      b[b.length - 1].state.bestChromosome?.genes,
    )
  })
})

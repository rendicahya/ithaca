import { describe, expect, it } from 'vitest'

import { psoPseudocode, runPSO } from '../pso'
import { fitnessOf, OPTIMUM } from '../types'

describe('runPSO', () => {
  const steps = runPSO()
  const last = steps[steps.length - 1]

  it('terminates', () => {
    expect(last.state.done).toBe(true)
  })

  it('never exceeds the configured maximum number of iterations', () => {
    expect(last.state.iteration).toBeLessThanOrEqual(last.state.maxIterations + 1)
  })

  it('converges the global best close to the true optimum', () => {
    expect(last.state.globalBestFitness).toBeLessThan(fitnessOf({ x: 0, y: 0 }))
    expect(Math.abs(last.state.globalBest.x - OPTIMUM.x)).toBeLessThan(2)
    expect(Math.abs(last.state.globalBest.y - OPTIMUM.y)).toBeLessThan(2)
  })

  it('keeps particle positions within the search bounds at every step', () => {
    for (const step of steps) {
      for (const particle of step.state.particles) {
        expect(particle.position.x).toBeGreaterThanOrEqual(step.state.bounds.min)
        expect(particle.position.x).toBeLessThanOrEqual(step.state.bounds.max)
        expect(particle.position.y).toBeGreaterThanOrEqual(step.state.bounds.min)
        expect(particle.position.y).toBeLessThanOrEqual(step.state.bounds.max)
      }
    }
  })

  it('never regresses the global best fitness across steps', () => {
    let previousBest = Infinity
    for (const step of steps) {
      expect(step.state.globalBestFitness).toBeLessThanOrEqual(previousBest + 1e-9)
      previousBest = step.state.globalBestFitness
    }
  })

  it('personal best fitness is never worse than the current fitness once compared', () => {
    // Line 6 evaluates a fresh fitness before the personalBest comparison on
    // line 8/9 runs, so the particle being updated is briefly ahead of its
    // own personalBest — every other particle must already be consistent.
    for (const step of steps) {
      for (const particle of step.state.particles) {
        if (step.activePseudocodeLine === 6 && particle.id === step.state.currentParticleId) continue
        expect(particle.personalBestFitness).toBeLessThanOrEqual(particle.fitness + 1e-9)
      }
    }
  })

  it('every step references a valid pseudocode line', () => {
    for (const step of steps) {
      expect(step.activePseudocodeLine).toBeGreaterThanOrEqual(1)
      expect(step.activePseudocodeLine).toBeLessThanOrEqual(psoPseudocode.length)
    }
  })
})

describe('runPSO — determinism', () => {
  it('produces an identical run every time given the fixed seed', () => {
    const a = runPSO()
    const b = runPSO()
    expect(a.length).toBe(b.length)
    expect(a[a.length - 1].state.globalBest).toEqual(b[b.length - 1].state.globalBest)
  })
})

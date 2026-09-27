import { describe, expect, it } from 'vitest'

import { runSelectionDemo, selectionPseudocode } from '../selection'

describe('runSelectionDemo', () => {
  const steps = runSelectionDemo()

  it('produces one step per pseudocode line', () => {
    expect(steps.length).toBe(selectionPseudocode.length)
  })

  it('every step references a valid pseudocode line', () => {
    for (const step of steps) {
      expect(step.activePseudocodeLine).toBeGreaterThanOrEqual(1)
      expect(step.activePseudocodeLine).toBeLessThanOrEqual(selectionPseudocode.length)
    }
  })

  it('picks a roulette winner within the population', () => {
    const last = steps[steps.length - 1]
    const ids = last.state.population.map((p) => p.id)
    expect(ids).toContain(last.state.rouletteWinnerId)
  })

  it('picks a tournament winner with the highest fitness among the chosen candidates', () => {
    const last = steps[steps.length - 1]
    const candidates = last.state.population.filter((p) =>
      last.state.tournamentCandidateIds.includes(p.id),
    )
    const bestFitness = Math.max(...candidates.map((c) => c.fitness))
    const winner = last.state.population.find((p) => p.id === last.state.tournamentWinnerId)
    expect(winner?.fitness).toBe(bestFitness)
  })

  it('chooses tournamentSize distinct candidates', () => {
    const last = steps[steps.length - 1]
    expect(last.state.tournamentCandidateIds.length).toBe(last.state.tournamentSize)
    expect(new Set(last.state.tournamentCandidateIds).size).toBe(last.state.tournamentSize)
  })

  it('produces an identical run every time (deterministic seed)', () => {
    const again = runSelectionDemo()
    expect(again[again.length - 1].state.rouletteWinnerId).toBe(
      steps[steps.length - 1].state.rouletteWinnerId,
    )
    expect(again[again.length - 1].state.tournamentWinnerId).toBe(
      steps[steps.length - 1].state.tournamentWinnerId,
    )
  })
})

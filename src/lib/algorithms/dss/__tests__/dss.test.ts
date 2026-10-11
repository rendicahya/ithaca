import { describe, expect, it } from 'vitest'

import { defaultPreferences } from '../catalog'
import { runDSS } from '../dss'

function finalState(preferences = defaultPreferences) {
  const steps = runDSS(preferences)
  return steps[steps.length - 1].state
}

function rankedNames(preferences = defaultPreferences): string[] {
  const state = finalState(preferences)
  return Object.entries(state.status)
    .filter(([, s]) => s.rank !== null)
    .sort(([, a], [, b]) => (a.rank ?? 0) - (b.rank ?? 0))
    .map(([id]) => id)
}

describe('runDSS', () => {
  it('eliminates products that violate each hard constraint, recording which one', () => {
    const state = finalState()
    expect(state.status.ideacentre.eliminatedBy).toBe('budget')
    expect(state.status.hp20.eliminatedBy).toBe('budget')
    expect(state.status.s200z.eliminatedBy).toBe('ram')
    expect(state.status.optiplex.eliminatedBy).toBeNull()
  })

  it('skips constraints the user left open', () => {
    const steps = runDSS({ ...defaultPreferences, formFactor: null })
    expect(steps.some((s) => s.state.activeConstraint === 'formFactor')).toBe(false)
  })

  it('scores candidates with Simple Additive Weighting', () => {
    const state = finalState()
    // balanced weights: 0.3 price + 0.3 cpu + 0.2 ram + 0.2 rating
    const expected = 0.3 * (1_500_000 / 3_800_000) + 0.3 * 1 + 0.2 * 1 + 0.2 * (4.0 / 4.5)
    expect(state.status.optiplex.score).toBeCloseTo(expected, 10)
    expect(state.status.ideacentre.score).toBeNull()
  })

  it('balanced priority ranks the high-performance tower first', () => {
    expect(rankedNames()).toEqual(['optiplex', 'acer', 'asus'])
  })

  it('budget priority changes the recommendation to the cheapest good option', () => {
    expect(rankedNames({ ...defaultPreferences, priority: 'budget' })[0]).toBe('acer')
  })

  it('ends with no recommendation when every product is filtered out', () => {
    const state = finalState({ ...defaultPreferences, maxBudget: 4_000_000, minRam: 8, formFactor: 'aio' })
    expect(state.done).toBe(true)
    expect(Object.values(state.status).every((s) => s.rank === null)).toBe(true)
  })

  it('is deterministic', () => {
    expect(runDSS()).toEqual(runDSS())
  })
})

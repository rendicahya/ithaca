import { describe, expect, it } from 'vitest'

import { runStrokeExpertSystem } from '../expertSystem'
import { factorIds, patientProfiles } from '../scorecard'
import type { Answers, PatientId } from '../scorecard'

function profile(id: PatientId): Answers {
  return patientProfiles.find((p) => p.id === id)!.answers
}

function finalState(answers: Answers) {
  const steps = runStrokeExpertSystem(answers)
  return steps[steps.length - 1].state
}

describe('runStrokeExpertSystem', () => {
  it('fires one scoring rule per risk factor, in scorecard order', () => {
    const steps = runStrokeExpertSystem(profile('a'))
    const scored = steps.filter((s) => s.traceEntry?.key === 'expertSystem.score.trace')
    expect(scored).toHaveLength(factorIds.length)
    expect(scored.map((s) => s.state.currentFactor)).toEqual(factorIds)
  })

  it('tallies each column and the totals always add up to the number of factors', () => {
    const state = finalState(profile('a'))
    expect(state.score).toEqual({ high: 4, caution: 3, low: 1 })
    expect(state.score.high + state.score.caution + state.score.low).toBe(factorIds.length)
  })

  it('patient A: R1 (High ≥ 3) fires first → High risk', () => {
    const state = finalState(profile('a'))
    expect(state.ruleChecks).toEqual([{ rule: 'r1', fired: true }])
    expect(state.conclusion).toBe('high')
  })

  it('patient B: R1 fails, R2 (4 ≤ Caution ≤ 6) fires → Caution', () => {
    const state = finalState(profile('b'))
    expect(state.ruleChecks).toEqual([
      { rule: 'r1', fired: false },
      { rule: 'r2', fired: true },
    ])
    expect(state.conclusion).toBe('caution')
  })

  it('patient C: R3 (6 ≤ Low ≤ 8) fires → Low risk', () => {
    const state = finalState(profile('c'))
    expect(state.ruleChecks.map((c) => c.fired)).toEqual([false, false, true])
    expect(state.conclusion).toBe('low')
  })

  it('patient D: no rule on the card fires, so the default rule concludes Caution', () => {
    const state = finalState(profile('d'))
    expect(state.score).toEqual({ high: 2, caution: 3, low: 3 })
    expect(state.ruleChecks.at(-1)).toEqual({ rule: 'default', fired: true })
    expect(state.conclusion).toBe('caution')
  })

  it('prioritises High risk even when Caution is also within its range', () => {
    const answers: Answers = {
      ...profile('b'),
      atrialFibrillation: 'high',
      diabetes: 'high',
      strokeInFamily: 'high',
    }
    const state = finalState(answers)
    expect(state.score).toEqual({ high: 3, caution: 5, low: 0 })
    expect(state.conclusion).toBe('high')
  })

  it('terminates with exactly one fired conclusion rule', () => {
    for (const p of patientProfiles) {
      const state = finalState(p.answers)
      expect(state.done).toBe(true)
      expect(state.ruleChecks.filter((c) => c.fired)).toHaveLength(1)
    }
  })

  it('is deterministic', () => {
    expect(runStrokeExpertSystem(profile('b'))).toEqual(runStrokeExpertSystem(profile('b')))
  })
})

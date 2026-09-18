import { describe, expect, it } from 'vitest'

import { linRegPseudocode, runLinearRegression } from '../linreg'

describe('runLinearRegression', () => {
  const steps = runLinearRegression()
  const last = steps[steps.length - 1]

  it('terminates', () => {
    expect(last.state.done).toBe(true)
  })

  it('converges close to the true underlying slope and intercept', () => {
    expect(last.state.m).toBeGreaterThan(1.8)
    expect(last.state.m).toBeLessThan(2.8)
    expect(last.state.b).toBeGreaterThan(-1)
    expect(last.state.b).toBeLessThan(3)
  })

  it('decreases the loss monotonically across epochs', () => {
    const losses = steps.map((s) => s.state.loss).filter((l): l is number => l !== null)
    for (let i = 1; i < losses.length; i++) {
      expect(losses[i]).toBeLessThanOrEqual(losses[i - 1] + 1e-9)
    }
    expect(losses[losses.length - 1]).toBeLessThan(losses[0] / 10)
  })

  it('never exceeds the configured maximum number of epochs', () => {
    expect(last.state.epoch).toBeLessThanOrEqual(last.state.maxEpochs + 1)
  })

  it('every step references a valid pseudocode line', () => {
    for (const step of steps) {
      expect(step.activePseudocodeLine).toBeGreaterThanOrEqual(1)
      expect(step.activePseudocodeLine).toBeLessThanOrEqual(linRegPseudocode.length)
    }
  })
})

describe('runLinearRegression — determinism', () => {
  it('produces an identical run every time', () => {
    const a = runLinearRegression()
    const b = runLinearRegression()
    expect(a.length).toBe(b.length)
    expect(a[a.length - 1].state.m).toBe(b[b.length - 1].state.m)
    expect(a[a.length - 1].state.b).toBe(b[b.length - 1].state.b)
  })
})

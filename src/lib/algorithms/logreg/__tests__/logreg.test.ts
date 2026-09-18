import { describe, expect, it } from 'vitest'

import { logRegDataset } from '../dataset'
import { logRegPseudocode, runLogisticRegression } from '../logreg'

describe('runLogisticRegression', () => {
  const steps = runLogisticRegression()
  const last = steps[steps.length - 1]

  it('terminates', () => {
    expect(last.state.done).toBe(true)
  })

  it('classifies the cleanly-separable dataset perfectly by the end', () => {
    const correct = last.state.predictions.filter((p) => p.predictedLabel === p.point.label).length
    expect(correct).toBe(logRegDataset.length)
  })

  it('decreases the loss monotonically across epochs', () => {
    const losses = steps.map((s) => s.state.loss).filter((l): l is number => l !== null)
    for (let i = 1; i < losses.length; i++) {
      expect(losses[i]).toBeLessThanOrEqual(losses[i - 1] + 1e-9)
    }
  })

  it('never exceeds the configured maximum number of epochs', () => {
    expect(last.state.epoch).toBeLessThanOrEqual(last.state.maxEpochs + 1)
  })

  it('every step references a valid pseudocode line', () => {
    for (const step of steps) {
      expect(step.activePseudocodeLine).toBeGreaterThanOrEqual(1)
      expect(step.activePseudocodeLine).toBeLessThanOrEqual(logRegPseudocode.length)
    }
  })
})

describe('runLogisticRegression — determinism', () => {
  it('produces an identical run every time', () => {
    const a = runLogisticRegression()
    const b = runLogisticRegression()
    expect(a.length).toBe(b.length)
    expect(a[a.length - 1].state.weights).toEqual(b[b.length - 1].state.weights)
  })
})

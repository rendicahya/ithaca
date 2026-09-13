import { describe, expect, it } from 'vitest'

import { defaultQuery, playTennisDataset } from '../dataset'
import { naiveBayesPseudocode, runNaiveBayes } from '../naiveBayes'

describe('runNaiveBayes — classic Play Tennis query (Sunny, Cool, High, Strong)', () => {
  const steps = runNaiveBayes()
  const last = steps[steps.length - 1]

  it('terminates', () => {
    expect(last.state.done).toBe(true)
  })

  it('matches the textbook result: predicts No', () => {
    expect(last.state.predictedClass).toBe('No')
  })

  it('computes the correct prior for each class', () => {
    expect(last.state.results.Yes.prior).toBeCloseTo(9 / 14, 5)
    expect(last.state.results.No.prior).toBeCloseTo(5 / 14, 5)
  })

  it('computes the correct likelihoods for class No', () => {
    const byFeature = Object.fromEntries(
      last.state.results.No.likelihoods.map((l) => [l.feature, l.probability]),
    )
    expect(byFeature.outlook).toBeCloseTo(3 / 5, 5)
    expect(byFeature.temperature).toBeCloseTo(1 / 5, 5)
    expect(byFeature.humidity).toBeCloseTo(4 / 5, 5)
    expect(byFeature.wind).toBeCloseTo(3 / 5, 5)
  })

  it('computes the correct likelihoods for class Yes', () => {
    const byFeature = Object.fromEntries(
      last.state.results.Yes.likelihoods.map((l) => [l.feature, l.probability]),
    )
    expect(byFeature.outlook).toBeCloseTo(2 / 9, 5)
    expect(byFeature.temperature).toBeCloseTo(3 / 9, 5)
    expect(byFeature.humidity).toBeCloseTo(3 / 9, 5)
    expect(byFeature.wind).toBeCloseTo(3 / 9, 5)
  })

  it('computes unnormalized posteriors as prior times the product of likelihoods', () => {
    expect(last.state.results.No.posterior).toBeCloseTo(0.020571, 5)
    expect(last.state.results.Yes.posterior).toBeCloseTo(0.005291, 5)
  })

  it('normalizes posteriors to sum to 1', () => {
    const sum = (last.state.results.Yes.normalized ?? 0) + (last.state.results.No.normalized ?? 0)
    expect(sum).toBeCloseTo(1, 5)
  })

  it('records a predict trace entry naming the winning class', () => {
    expect(last.traceEntry?.key).toBe('naiveBayes.predict.trace')
    expect(last.traceEntry?.params?.class).toBe('No')
  })

  it('every step references a valid pseudocode line', () => {
    for (const step of steps) {
      expect(step.activePseudocodeLine).toBeGreaterThanOrEqual(1)
      expect(step.activePseudocodeLine).toBeLessThanOrEqual(naiveBayesPseudocode.length)
    }
  })
})

describe('runNaiveBayes — is deterministic and pure', () => {
  it('produces identical results across runs', () => {
    const a = runNaiveBayes()
    const b = runNaiveBayes()
    expect(a[a.length - 1].state.predictedClass).toBe(b[b.length - 1].state.predictedClass)
  })

  it('does not mutate the dataset it is given', () => {
    const before = JSON.stringify(playTennisDataset)
    runNaiveBayes(playTennisDataset, defaultQuery)
    expect(JSON.stringify(playTennisDataset)).toBe(before)
  })
})

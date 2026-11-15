import { describe, expect, it } from 'vitest'

import { ensembleMethods } from '..'
import { runBagging } from '../bagging'
import { runBoosting } from '../boosting'
import { BAGGING_MODELS, BOOSTING_ROUNDS, ensembleDataset, STACKING_FOLDS } from '../dataset'
import { countCorrect, predictStump, trainLogisticRegression, trainStump } from '../models'
import type { DataPoint, Label } from '../models'
import { runStacking } from '../stacking'
import type { BaggingState, BoostingState, StackingState } from '../types'

const uniform = (points: DataPoint[]) => points.map(() => 1)

describe('trainStump', () => {
  it('finds a perfect split when one exists', () => {
    const points: DataPoint[] = [
      { id: 'a', x: 1, y: 0, label: 1 },
      { id: 'b', x: 2, y: 0, label: 1 },
      { id: 'c', x: 3, y: 0, label: -1 },
    ]
    const { stump, error } = trainStump(points, uniform(points))
    expect(error).toBe(0)
    expect(stump).toEqual({ feature: 'x', threshold: 2.5, below: 1 })
  })

  it('respects sample weights', () => {
    const points: DataPoint[] = [
      { id: 'a', x: 1, y: 0, label: 1 },
      { id: 'b', x: 2, y: 0, label: -1 },
      { id: 'c', x: 3, y: 0, label: 1 },
    ]
    // With b dominating, the best stump must classify b correctly.
    const { stump } = trainStump(points, [1, 10, 1])
    expect(predictStump(stump, points[1])).toBe(-1)
  })

  it('no single stump fits the teaching dataset (the gap ensembles close)', () => {
    const { error } = trainStump(ensembleDataset, uniform(ensembleDataset))
    expect(error).toBeCloseTo(0.2)
  })
})

describe('trainLogisticRegression', () => {
  it('puts the largest weight on the feature that matches the label', () => {
    const labels: Label[] = [1, 1, -1, -1]
    const features: Label[][] = [
      [1, -1],
      [1, 1],
      [-1, 1],
      [-1, -1],
    ]
    const { weights } = trainLogisticRegression(features, labels)
    expect(weights[0]).toBeGreaterThan(1)
    expect(Math.abs(weights[1])).toBeLessThan(0.1)
  })
})

describe('runBagging', () => {
  const steps = runBagging()
  const last = steps[steps.length - 1].state as BaggingState

  it('terminates with a prediction', () => {
    expect(last.done).toBe(true)
    expect(last.prediction).not.toBeNull()
  })

  it('builds B models, each from a bootstrap sample of size n', () => {
    expect(last.models).toHaveLength(BAGGING_MODELS)
    for (const model of last.models) {
      expect(model.counts.reduce((s, c) => s + c, 0)).toBe(ensembleDataset.length)
    }
  })

  it('bootstrap samples differ and leave some points out', () => {
    const signatures = new Set(last.models.map((m) => m.counts.join(',')))
    expect(signatures.size).toBe(BAGGING_MODELS)
    expect(last.models.some((m) => m.counts.includes(0))).toBe(true)
  })

  it('predicts the majority of the votes', () => {
    const positive = last.models.filter((m) => m.vote === 1).length
    expect(last.prediction).toBe(positive > BAGGING_MODELS / 2 ? 1 : -1)
  })

  it('the ensemble beats every individual model on the training data', () => {
    const best = Math.max(...last.models.map((m) => m.correct))
    expect(last.ensembleCorrect).toBeGreaterThan(best)
  })
})

describe('runBoosting', () => {
  const steps = runBoosting()
  const last = steps[steps.length - 1].state as BoostingState

  it('runs T rounds and terminates', () => {
    expect(last.rounds).toHaveLength(BOOSTING_ROUNDS)
    expect(last.done).toBe(true)
  })

  it('keeps the weights normalized after every update', () => {
    for (const step of steps) {
      const state = step.state as BoostingState
      expect(state.weights.reduce((s, w) => s + w, 0)).toBeCloseTo(1)
    }
  })

  it('raises the weight of misclassified points and lowers the rest', () => {
    const update = steps.find((s) => s.activePseudocodeLine === 6)!.state as BoostingState
    update.points.forEach((p, i) => {
      const before = update.previousWeights![i]
      if (update.misclassified.includes(p.id)) expect(update.weights[i]).toBeGreaterThan(before)
      else expect(update.weights[i]).toBeLessThan(before)
    })
  })

  it('misclassified points carry exactly half the weight after an update', () => {
    // A known AdaBoost property: after reweighting, h_t has weighted error 0.5.
    const update = steps.find((s) => s.activePseudocodeLine === 6)!.state as BoostingState
    const wrongWeight = update.points.reduce(
      (s, p, i) => (update.misclassified.includes(p.id) ? s + update.weights[i] : s),
      0,
    )
    expect(wrongWeight).toBeCloseTo(0.5)
  })

  it('gives more accurate stumps a larger α', () => {
    for (const round of last.rounds) {
      expect(round.alpha).toBeCloseTo(0.5 * Math.log((1 - round.error!) / round.error!))
    }
  })

  it('training accuracy improves to 100% over the rounds (bias reduction)', () => {
    const accuracies = last.rounds.map((r) => r.ensembleCorrect!)
    expect(accuracies[0]).toBe(8)
    expect(accuracies[accuracies.length - 1]).toBe(ensembleDataset.length)
    for (let i = 1; i < accuracies.length; i++) expect(accuracies[i]).toBeGreaterThanOrEqual(accuracies[i - 1])
    expect(last.misclassified).toEqual([])
  })

  it('predicts sign(F(x_query))', () => {
    expect(last.prediction).toBe(last.score! >= 0 ? 1 : -1)
  })
})

describe('runStacking', () => {
  const steps = runStacking()
  const last = steps[steps.length - 1].state as StackingState

  it('terminates with a probability and prediction', () => {
    expect(last.done).toBe(true)
    expect(last.probability).toBeGreaterThan(0)
    expect(last.probability).toBeLessThan(1)
    expect(last.prediction).toBe(last.probability! >= 0.5 ? 1 : -1)
  })

  it('fills every meta-training row out-of-fold, one fold at a time', () => {
    expect(last.metaRows.every((r) => r !== null && r.length === 3)).toBe(true)
    const foldSteps = steps.filter((s) => s.activePseudocodeLine === 4)
    expect(foldSteps).toHaveLength(STACKING_FOLDS)
    foldSteps.forEach((step, k) => {
      const state = step.state as StackingState
      state.metaRows.forEach((row, i) => {
        expect(row !== null).toBe(state.folds[i] <= k)
      })
    })
  })

  it('every fold holds out one point of each class', () => {
    for (let k = 0; k < STACKING_FOLDS; k++) {
      const labels = last.points.filter((_, i) => last.folds[i] === k).map((p) => p.label)
      expect([...labels].sort()).toEqual([-1, 1])
    }
  })

  it('the meta-model learns to trust the k-NN base model most', () => {
    const weights = last.meta!.weights
    expect(weights.indexOf(Math.max(...weights))).toBe(1)
  })

  it('retrained base models are evaluated on the full dataset', () => {
    for (const model of last.baseModels) {
      expect(model.correct).toBe(countCorrect(model.classifier!, ensembleDataset))
    }
  })
})

describe('ensemble methods — shared properties', () => {
  for (const method of ensembleMethods) {
    it(`${method.id}: every step references a valid pseudocode line`, () => {
      for (const step of method.run()) {
        expect(step.activePseudocodeLine).toBeGreaterThanOrEqual(1)
        expect(step.activePseudocodeLine).toBeLessThanOrEqual(method.pseudocode.length)
      }
    })

    it(`${method.id}: is deterministic`, () => {
      expect(method.run()).toEqual(method.run())
    })

    it(`${method.id}: hides the query point during training`, () => {
      // The query first appears on the step that evaluates the model(s) on it.
      const firstQueryLine = { bagging: 5, boosting: 7, stacking: 7 }[method.id]
      for (const step of method.run()) {
        expect(step.state.queryVisible).toBe(step.activePseudocodeLine >= firstQueryLine)
      }
    })

    it(`${method.id}: steps are independent snapshots`, () => {
      const steps = method.run()
      expect(steps[0].state.done).toBe(false)
      expect(steps[0].state.prediction).toBeNull()
    })
  }
})

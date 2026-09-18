import { msg } from '@/lib/i18n/translate'

import { LEARNING_RATE, logRegDataset, MAX_EPOCHS } from './dataset'
import { cloneState, sigmoid } from './types'
import type { LogRegState, LogRegStep, PointPrediction, Weights } from './types'

export const logRegPseudocode = [
  'initialize weights w1, w2, b ← 0',
  'while epoch < maxEpochs',
  '    for each point (x1, x2, y)',
  '        probability ← sigmoid(w1·x1 + w2·x2 + b)',
  '    compute mean cross-entropy loss over the dataset',
  '    compute the gradient of the loss w.r.t. w1, w2, b',
  '    w1, w2, b ← w1, w2, b − learningRate × gradient',
  '    epoch ← epoch + 1',
  'return final weights (w1, w2, b)',
]

function predict(weights: Weights, point: { x: number; y: number }): number {
  return sigmoid(weights.w1 * point.x + weights.w2 * point.y + weights.b)
}

export function runLogisticRegression(): LogRegStep[] {
  const steps: LogRegStep[] = []
  const n = logRegDataset.length

  const state: LogRegState = {
    epoch: 1,
    maxEpochs: MAX_EPOCHS,
    learningRate: LEARNING_RATE,
    weights: { w1: 0, w2: 0, b: 0 },
    predictions: logRegDataset.map((point) => ({ point, probability: 0.5, predictedLabel: 0 })),
    loss: null,
    gradients: null,
    done: false,
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 1,
    explanation: msg('logreg.init', { count: n }),
    traceEntry: msg('logreg.init.trace'),
  })

  while (state.epoch <= MAX_EPOCHS) {
    const predictions: PointPrediction[] = logRegDataset.map((point) => {
      const probability = predict(state.weights, point)
      return { point, probability, predictedLabel: probability >= 0.5 ? 1 : 0 }
    })
    state.predictions = predictions

    const loss =
      -predictions.reduce((sum, p) => {
        const y = p.point.label
        const eps = 1e-9
        return sum + (y * Math.log(p.probability + eps) + (1 - y) * Math.log(1 - p.probability + eps))
      }, 0) / n
    state.loss = loss

    const correct = predictions.filter((p) => p.predictedLabel === p.point.label).length

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 4,
      explanation: msg('logreg.forward', {
        epoch: state.epoch,
        loss: loss.toFixed(4),
        correct,
        total: n,
      }),
      traceEntry: msg('logreg.forward.trace', { epoch: state.epoch, loss: loss.toFixed(4) }),
    })

    let dw1 = 0
    let dw2 = 0
    let db = 0
    for (const p of predictions) {
      const error = p.probability - p.point.label
      dw1 += error * p.point.x
      dw2 += error * p.point.y
      db += error
    }
    dw1 /= n
    dw2 /= n
    db /= n
    state.gradients = { w1: dw1, w2: dw2, b: db }

    state.weights = {
      w1: state.weights.w1 - LEARNING_RATE * dw1,
      w2: state.weights.w2 - LEARNING_RATE * dw2,
      b: state.weights.b - LEARNING_RATE * db,
    }

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 6,
      explanation: msg('logreg.update', {
        epoch: state.epoch,
        w1: state.weights.w1.toFixed(3),
        w2: state.weights.w2.toFixed(3),
        b: state.weights.b.toFixed(3),
      }),
      traceEntry: msg('logreg.update.trace', { epoch: state.epoch }),
    })

    state.epoch += 1
  }

  state.done = true
  const finalCorrect = state.predictions.filter((p) => p.predictedLabel === p.point.label).length
  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 8,
    explanation: msg('logreg.result', {
      w1: state.weights.w1.toFixed(3),
      w2: state.weights.w2.toFixed(3),
      b: state.weights.b.toFixed(3),
      correct: finalCorrect,
      total: n,
    }),
    traceEntry: msg('logreg.result.trace', { correct: finalCorrect, total: n }),
  })

  return steps
}

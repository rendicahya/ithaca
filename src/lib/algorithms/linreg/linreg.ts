import { msg } from '@/lib/i18n/translate'

import { LEARNING_RATE, linRegDataset, MAX_EPOCHS } from './dataset'
import { cloneState } from './types'
import type { LinRegState, LinRegStep } from './types'

export const linRegPseudocode = [
  'initialize m, b ← 0',
  'while epoch < maxEpochs',
  '    for each point (x, y)',
  '        prediction ← m·x + b',
  '    compute mean squared error over the dataset',
  '    compute the gradient of the loss w.r.t. m and b',
  '    m, b ← m, b − learningRate × gradient',
  '    epoch ← epoch + 1',
  'return final m, b',
]

export function runLinearRegression(): LinRegStep[] {
  const steps: LinRegStep[] = []
  const n = linRegDataset.length

  const state: LinRegState = {
    epoch: 1,
    maxEpochs: MAX_EPOCHS,
    learningRate: LEARNING_RATE,
    m: 0,
    b: 0,
    loss: null,
    gradients: null,
    done: false,
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 1,
    explanation: msg('linreg.init', { count: n }),
    traceEntry: msg('linreg.init.trace'),
  })

  while (state.epoch <= MAX_EPOCHS) {
    const predictions = linRegDataset.map((p) => state.m * p.x + state.b)
    const loss = predictions.reduce((sum, pred, i) => sum + (pred - linRegDataset[i].y) ** 2, 0) / n
    state.loss = loss

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 5,
      explanation: msg('linreg.forward', {
        epoch: state.epoch,
        m: state.m.toFixed(3),
        b: state.b.toFixed(3),
        loss: loss.toFixed(2),
      }),
      traceEntry: msg('linreg.forward.trace', { epoch: state.epoch, loss: loss.toFixed(2) }),
    })

    let dm = 0
    let db = 0
    predictions.forEach((pred, i) => {
      const error = pred - linRegDataset[i].y
      dm += error * linRegDataset[i].x
      db += error
    })
    dm = (2 * dm) / n
    db = (2 * db) / n
    state.gradients = { dm, db }

    state.m = state.m - LEARNING_RATE * dm
    state.b = state.b - LEARNING_RATE * db

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 7,
      explanation: msg('linreg.update', {
        epoch: state.epoch,
        m: state.m.toFixed(3),
        b: state.b.toFixed(3),
      }),
      traceEntry: msg('linreg.update.trace', { epoch: state.epoch }),
    })

    state.epoch += 1
  }

  state.done = true
  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 9,
    explanation: msg('linreg.result', {
      m: state.m.toFixed(3),
      b: state.b.toFixed(3),
      loss: (state.loss as number).toFixed(2),
    }),
    traceEntry: msg('linreg.result.trace', { m: state.m.toFixed(3), b: state.b.toFixed(3) }),
  })

  return steps
}

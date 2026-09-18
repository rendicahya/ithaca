import type { Message } from '@/lib/i18n/translate'

import type { LabeledPoint } from './dataset'

export interface PointPrediction {
  point: LabeledPoint
  probability: number
  predictedLabel: 0 | 1
}

export interface Weights {
  w1: number
  w2: number
  b: number
}

export interface LogRegState {
  epoch: number
  maxEpochs: number
  learningRate: number
  weights: Weights
  predictions: PointPrediction[]
  loss: number | null
  gradients: Weights | null
  done: boolean
}

export interface LogRegStep {
  state: LogRegState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
}

export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z))
}

export function cloneState(state: LogRegState): LogRegState {
  return {
    ...state,
    weights: { ...state.weights },
    predictions: state.predictions.map((p) => ({ ...p, point: { ...p.point } })),
    gradients: state.gradients ? { ...state.gradients } : null,
  }
}

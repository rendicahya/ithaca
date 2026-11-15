import { msg } from '@/lib/i18n/translate'

import { ensembleDataset, ensembleQuery, STACKING_FOLDS, STACKING_KNN_K } from './dataset'
import { formatNumber } from './format'
import {
  countCorrect,
  formatLabel,
  metaProbability,
  predict,
  trainCentroid,
  trainLogisticRegression,
  trainStump,
} from './models'
import type { Classifier, DataPoint, Label } from './models'
import { snapshot } from './types'
import type { BaseModelKind, EnsembleStep, StackingState } from './types'

export const stackingPseudocode = [
  'split D into K folds',
  'for k = 1 to K',
  '    train f_1 … f_M on every fold except fold k',
  '    Z[fold k] ← (f_1(x), …, f_M(x)) for each x in fold k',
  'g ← train logistic regression on (Z, y)',
  'retrain f_1 … f_M on all of D',
  'z ← (f_1(x_query), …, f_M(x_query))',
  'return g(z)',
]

export const STACKING_BASE_MODELS: BaseModelKind[] = ['stump', 'knn', 'centroid']

/** Language-neutral short names used inside explanations, e.g. "f2 (3-NN)". */
export function baseModelShortName(kind: BaseModelKind): string {
  switch (kind) {
    case 'stump':
      return 'Stump'
    case 'knn':
      return `${STACKING_KNN_K}-NN`
    case 'centroid':
      return 'Centroid'
  }
}

function trainBaseModel(kind: BaseModelKind, train: DataPoint[]): Classifier {
  switch (kind) {
    case 'stump':
      return { kind: 'stump', stump: trainStump(train, train.map(() => 1)).stump }
    case 'knn':
      return { kind: 'knn', k: STACKING_KNN_K, train }
    case 'centroid':
      return trainCentroid(train)
  }
}

const modelLabel = (j: number): string => `f${j + 1} (${baseModelShortName(STACKING_BASE_MODELS[j])})`
const formatVector = (labels: Label[]): string => `(${labels.map(formatLabel).join(', ')})`

export function runStacking(): EnsembleStep[] {
  const steps: EnsembleStep[] = []
  const points = ensembleDataset
  const n = points.length
  // Round-robin assignment: with the dataset's class ordering, every fold
  // holds out one +1 point and one −1 point.
  const folds = points.map((_, i) => i % STACKING_FOLDS)

  const state: StackingState = {
    method: 'stacking',
    points,
    query: { ...ensembleQuery },
    focus: null,
    focusCaption: null,
    misclassified: [],
    prediction: null,
    done: false,
    folds,
    foldCount: STACKING_FOLDS,
    currentFold: null,
    metaRows: points.map(() => null),
    baseModels: STACKING_BASE_MODELS.map((kind) => ({ kind, classifier: null, correct: null, vote: null })),
    meta: null,
    metaCorrect: null,
    probability: null,
  }

  steps.push({
    state: snapshot(state),
    activePseudocodeLine: 1,
    explanation: msg('ensemble.stacking.init', {
      n,
      folds: STACKING_FOLDS,
      size: n / STACKING_FOLDS,
      models: STACKING_BASE_MODELS.map((_, j) => modelLabel(j)).join(', '),
    }),
    traceEntry: msg('ensemble.stacking.init.trace', { folds: STACKING_FOLDS }),
  })

  for (let k = 0; k < STACKING_FOLDS; k++) {
    const label = k + 1
    const heldOut = points.filter((_, i) => folds[i] === k)
    const train = points.filter((_, i) => folds[i] !== k)
    const models = STACKING_BASE_MODELS.map((kind) => trainBaseModel(kind, train))

    state.currentFold = k

    steps.push({
      state: snapshot(state),
      activePseudocodeLine: 3,
      explanation: msg('ensemble.stacking.trainFold', {
        k: label,
        train: train.length,
        heldOut: heldOut.map((p) => p.id).join(', '),
      }),
      traceEntry: msg('ensemble.stacking.trainFold.trace', { k: label }),
    })

    const rows: string[] = []
    points.forEach((p, i) => {
      if (folds[i] !== k) return
      const row = models.map((m) => predict(m, p))
      state.metaRows[i] = row
      rows.push(`${p.id} → ${formatVector(row)}`)
    })

    steps.push({
      state: snapshot(state),
      activePseudocodeLine: 4,
      explanation: msg('ensemble.stacking.predictFold', { k: label, rows: rows.join('; ') }),
      traceEntry: msg('ensemble.stacking.predictFold.trace', { k: label }),
    })
  }

  state.currentFold = null
  const metaFeatures = state.metaRows as Label[][]
  const labels = points.map((p) => p.label)
  const meta = trainLogisticRegression(metaFeatures, labels)
  state.meta = meta
  state.metaCorrect = metaFeatures.filter(
    (row, i) => (metaProbability(meta.bias, meta.weights, row) >= 0.5 ? 1 : -1) === labels[i],
  ).length
  const trusted = meta.weights.indexOf(Math.max(...meta.weights))

  steps.push({
    state: snapshot(state),
    activePseudocodeLine: 5,
    explanation: msg('ensemble.stacking.meta', {
      bias: formatNumber(meta.bias),
      weights: meta.weights.map((w, j) => `w${j + 1} = ${formatNumber(w)}`).join(', '),
      trusted: modelLabel(trusted),
    }),
    traceEntry: msg('ensemble.stacking.meta.trace'),
  })

  state.baseModels.forEach((model) => {
    model.classifier = trainBaseModel(model.kind, points)
    model.correct = countCorrect(model.classifier, points)
  })

  steps.push({
    state: snapshot(state),
    activePseudocodeLine: 6,
    explanation: msg('ensemble.stacking.retrain', {
      accuracies: state.baseModels.map((m, j) => `${modelLabel(j)} ${m.correct}/${n}`).join(', '),
    }),
    traceEntry: msg('ensemble.stacking.retrain.trace'),
  })

  state.baseModels.forEach((model) => (model.vote = predict(model.classifier as Classifier, state.query)))
  const z = state.baseModels.map((m) => m.vote as Label)

  steps.push({
    state: snapshot(state),
    activePseudocodeLine: 7,
    explanation: msg('ensemble.stacking.queryFeatures', { z: formatVector(z) }),
    traceEntry: msg('ensemble.stacking.queryFeatures.trace', { z: formatVector(z) }),
  })

  const probability = metaProbability(meta.bias, meta.weights, z)
  const prediction: Label = probability >= 0.5 ? 1 : -1
  const ensemble: Classifier = {
    kind: 'meta',
    members: state.baseModels.map((m) => m.classifier as Classifier),
    bias: meta.bias,
    weights: meta.weights,
  }
  state.probability = probability
  state.prediction = prediction
  state.focus = ensemble
  state.focusCaption = msg('ensemble.caption.stacking')
  state.misclassified = points.filter((p) => predict(ensemble, p) !== p.label).map((p) => p.id)
  state.done = true

  const positiveVotes = z.filter((v) => v === 1).length

  steps.push({
    state: snapshot(state),
    activePseudocodeLine: 8,
    explanation: msg('ensemble.stacking.predict', {
      sum: formatNumber(meta.bias).replace('-', '−') +
        meta.weights
          .map((w, j) => ` ${w >= 0 ? '+' : '−'} ${formatNumber(Math.abs(w))}·(${formatLabel(z[j])})`)
          .join(''),
      p: formatNumber(probability, 3),
      label: formatLabel(prediction),
      positive: positiveVotes,
      negative: z.length - positiveVotes,
    }),
    traceEntry: msg('ensemble.stacking.predict.trace', { label: formatLabel(prediction), p: formatNumber(probability, 3) }),
  })

  return steps
}

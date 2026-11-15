import { msg } from '@/lib/i18n/translate'
import { createRng, randomInt } from '@/lib/random'

import { BAGGING_MODELS, BAGGING_SEED, ensembleDataset, ensembleQuery } from './dataset'
import { formatStump } from './format'
import { countCorrect, formatLabel, predict, predictStump, trainStump } from './models'
import type { Classifier } from './models'
import { snapshot } from './types'
import type { BaggingState, EnsembleStep } from './types'

export const baggingPseudocode = [
  'for b = 1 to B',
  '    D_b ← bootstrap sample: draw n points from D with replacement',
  '    f_b ← train a decision stump on D_b',
  'for b = 1 to B',
  '    vote_b ← f_b(x_query)',
  'ŷ ← majority vote of vote_1 … vote_B',
  'return ŷ',
]

export function runBagging(): EnsembleStep[] {
  const steps: EnsembleStep[] = []
  const points = ensembleDataset
  const n = points.length
  const rng = createRng(BAGGING_SEED)

  const state: BaggingState = {
    method: 'bagging',
    points,
    query: { ...ensembleQuery },
    focus: null,
    focusCaption: null,
    misclassified: [],
    prediction: null,
    done: false,
    models: [],
    current: null,
    sampleCounts: null,
    ensembleCorrect: null,
  }

  steps.push({
    state: snapshot(state),
    activePseudocodeLine: 1,
    explanation: msg('ensemble.bagging.init', { n, models: BAGGING_MODELS }),
    traceEntry: msg('ensemble.bagging.init.trace', { models: BAGGING_MODELS }),
  })

  for (let b = 0; b < BAGGING_MODELS; b++) {
    const label = b + 1
    const counts = points.map(() => 0)
    for (let draw = 0; draw < n; draw++) counts[randomInt(rng, 0, n)]++

    state.current = b
    state.sampleCounts = counts
    state.focus = null
    state.focusCaption = null
    state.misclassified = []

    const repeated = points.flatMap((p, i) => (counts[i] > 1 ? [`${p.id}×${counts[i]}`] : []))
    const missing = points.filter((_, i) => counts[i] === 0).map((p) => p.id)

    steps.push({
      state: snapshot(state),
      activePseudocodeLine: 2,
      explanation: msg('ensemble.bagging.bootstrap', {
        b: label,
        n,
        repeated: repeated.join(', ') || '—',
        missing: missing.join(', ') || '—',
      }),
      traceEntry: msg('ensemble.bagging.bootstrap.trace', { b: label, missing: missing.length }),
    })

    // Training on a bootstrap sample = training on the drawn points, each
    // weighted by how often it was drawn.
    const sample = points.filter((_, i) => counts[i] > 0)
    const { stump } = trainStump(
      sample,
      counts.filter((c) => c > 0),
    )
    const classifier: Classifier = { kind: 'stump', stump }
    const correct = countCorrect(classifier, points)
    state.models.push({ stump, counts, correct, vote: null })
    state.focus = classifier
    state.focusCaption = msg('ensemble.caption.model', { name: `f${label}`, rule: formatStump(stump) })
    state.misclassified = points.filter((p) => predictStump(stump, p) !== p.label).map((p) => p.id)

    steps.push({
      state: snapshot(state),
      activePseudocodeLine: 3,
      explanation: msg('ensemble.bagging.train', {
        b: label,
        rule: formatStump(stump),
        correct,
        n,
      }),
      traceEntry: msg('ensemble.bagging.train.trace', { b: label, rule: formatStump(stump) }),
    })
  }

  state.current = null
  state.sampleCounts = null
  for (const model of state.models) model.vote = predictStump(model.stump, state.query)

  const ensemble: Classifier = { kind: 'majority', members: state.models.map((m) => m.stump) }
  state.focus = ensemble
  state.focusCaption = msg('ensemble.caption.bagging', { models: BAGGING_MODELS })
  state.misclassified = points.filter((p) => predict(ensemble, p) !== p.label).map((p) => p.id)

  steps.push({
    state: snapshot(state),
    activePseudocodeLine: 5,
    explanation: msg('ensemble.bagging.votes', {
      votes: state.models.map((m, i) => `f${i + 1} = ${formatLabel(m.vote!)}`).join(', '),
    }),
    traceEntry: msg('ensemble.bagging.votes.trace'),
  })

  const positive = state.models.filter((m) => m.vote === 1).length
  const negative = state.models.length - positive
  const prediction = predict(ensemble, state.query)
  state.prediction = prediction
  state.ensembleCorrect = countCorrect(ensemble, points)
  state.done = true
  const bestSingle = Math.max(...state.models.map((m) => m.correct))

  steps.push({
    state: snapshot(state),
    activePseudocodeLine: 6,
    explanation: msg('ensemble.bagging.predict', {
      positive,
      negative,
      label: formatLabel(prediction),
      correct: state.ensembleCorrect,
      best: bestSingle,
      n,
    }),
    traceEntry: msg('ensemble.bagging.predict.trace', { label: formatLabel(prediction), positive, negative }),
  })

  return steps
}

import { msg } from '@/lib/i18n/translate'

import { BOOSTING_ROUNDS, ensembleDataset, ensembleQuery } from './dataset'
import { formatNumber, formatStump } from './format'
import { boostingScore, countCorrect, formatLabel, predict, predictStump, trainStump } from './models'
import type { Classifier } from './models'
import { snapshot } from './types'
import type { BoostingState, EnsembleStep } from './types'

export const boostingPseudocode = [
  'w_i ← 1/n for every training point i',
  'for t = 1 to T',
  '    h_t ← decision stump with the smallest weighted error',
  '    ε_t ← Σ w_i · 1(y_i ≠ h_t(x_i))',
  '    α_t ← ½ · ln((1 − ε_t) / ε_t)',
  '    w_i ← w_i · exp(−α_t · y_i · h_t(x_i)) / Z_t',
  'F(x_query) ← Σ α_t · h_t(x_query)',
  'return sign(F(x_query))',
]

// Guards α against division by zero if a stump ever classifies every point correctly.
const MIN_ERROR = 1e-10

export function runBoosting(): EnsembleStep[] {
  const steps: EnsembleStep[] = []
  const points = ensembleDataset
  const n = points.length

  const state: BoostingState = {
    method: 'boosting',
    points,
    query: { ...ensembleQuery },
    focus: null,
    focusCaption: null,
    misclassified: [],
    prediction: null,
    done: false,
    weights: points.map(() => 1 / n),
    previousWeights: null,
    rounds: [],
    current: null,
    score: null,
  }

  steps.push({
    state: snapshot(state),
    activePseudocodeLine: 1,
    explanation: msg('ensemble.boosting.init', { n, w: formatNumber(1 / n, 3), rounds: BOOSTING_ROUNDS }),
    traceEntry: msg('ensemble.boosting.init.trace', { w: formatNumber(1 / n, 3) }),
  })

  for (let t = 0; t < BOOSTING_ROUNDS; t++) {
    const label = t + 1
    const { stump } = trainStump(points, state.weights)
    const wrong = points.map((_, i) => i).filter((i) => predictStump(stump, points[i]) !== points[i].label)

    state.current = t
    state.previousWeights = null
    state.rounds.push({ stump, error: null, alpha: null, vote: null, ensembleCorrect: null })
    state.focus = { kind: 'stump', stump }
    state.focusCaption = msg('ensemble.caption.model', { name: `h${label}`, rule: formatStump(stump) })
    state.misclassified = wrong.map((i) => points[i].id)

    steps.push({
      state: snapshot(state),
      activePseudocodeLine: 3,
      explanation: msg('ensemble.boosting.train', {
        t: label,
        rule: formatStump(stump),
        wrong: state.misclassified.join(', '),
      }),
      traceEntry: msg('ensemble.boosting.train.trace', { t: label, rule: formatStump(stump) }),
    })

    const error = Math.max(
      MIN_ERROR,
      wrong.reduce((sum, i) => sum + state.weights[i], 0),
    )
    state.rounds[t].error = error

    steps.push({
      state: snapshot(state),
      activePseudocodeLine: 4,
      explanation: msg('ensemble.boosting.error', {
        t: label,
        terms: wrong.map((i) => `w(${points[i].id})`).join(' + '),
        values: wrong.map((i) => formatNumber(state.weights[i], 3)).join(' + '),
        error: formatNumber(error, 3),
      }),
      traceEntry: msg('ensemble.boosting.error.trace', { t: label, error: formatNumber(error, 3) }),
    })

    const alpha = 0.5 * Math.log((1 - error) / error)
    state.rounds[t].alpha = alpha

    steps.push({
      state: snapshot(state),
      activePseudocodeLine: 5,
      explanation: msg('ensemble.boosting.alpha', {
        t: label,
        error: formatNumber(error, 3),
        alpha: formatNumber(alpha, 3),
      }),
      traceEntry: msg('ensemble.boosting.alpha.trace', { t: label, alpha: formatNumber(alpha, 3) }),
    })

    const unnormalized = points.map(
      (p, i) => state.weights[i] * Math.exp(-alpha * p.label * predictStump(stump, p)),
    )
    const z = unnormalized.reduce((s, w) => s + w, 0)
    state.previousWeights = state.weights
    state.weights = unnormalized.map((w) => w / z)

    const ensembleSoFar: Classifier = {
      kind: 'weighted',
      members: state.rounds.map((r) => r.stump),
      alphas: state.rounds.map((r) => r.alpha as number),
    }
    const ensembleCorrect = countCorrect(ensembleSoFar, points)
    state.rounds[t].ensembleCorrect = ensembleCorrect

    steps.push({
      state: snapshot(state),
      activePseudocodeLine: 6,
      explanation: msg('ensemble.boosting.update', {
        t: label,
        wrong: state.misclassified.join(', '),
        up: formatNumber(Math.exp(alpha), 2),
        down: formatNumber(Math.exp(-alpha), 2),
        correct: ensembleCorrect,
        n,
      }),
      traceEntry: msg('ensemble.boosting.update.trace', { t: label, correct: ensembleCorrect, n }),
    })
  }

  const members = state.rounds.map((r) => r.stump)
  const alphas = state.rounds.map((r) => r.alpha as number)
  const ensemble: Classifier = { kind: 'weighted', members, alphas }
  for (const round of state.rounds) round.vote = predictStump(round.stump, state.query)

  const score = boostingScore(members, alphas, state.query)
  state.current = null
  state.previousWeights = null
  state.score = score
  state.focus = ensemble
  state.focusCaption = msg('ensemble.caption.boosting', { rounds: BOOSTING_ROUNDS })
  state.misclassified = points.filter((p) => predict(ensemble, p) !== p.label).map((p) => p.id)

  steps.push({
    state: snapshot(state),
    activePseudocodeLine: 7,
    explanation: msg('ensemble.boosting.score', {
      terms: state.rounds
        .map((r) => `${formatNumber(r.alpha as number, 2)}·(${formatLabel(r.vote as 1 | -1)})`)
        .join(' + '),
      score: formatNumber(score, 3),
    }),
    traceEntry: msg('ensemble.boosting.score.trace', { score: formatNumber(score, 3) }),
  })

  const prediction = score >= 0 ? 1 : -1
  state.prediction = prediction
  state.done = true
  const positiveVotes = state.rounds.filter((r) => r.vote === 1).length

  steps.push({
    state: snapshot(state),
    activePseudocodeLine: 8,
    explanation: msg('ensemble.boosting.predict', {
      score: formatNumber(score, 3),
      label: formatLabel(prediction),
      positive: positiveVotes,
      negative: state.rounds.length - positiveVotes,
    }),
    traceEntry: msg('ensemble.boosting.predict.trace', { label: formatLabel(prediction) }),
  })

  return steps
}

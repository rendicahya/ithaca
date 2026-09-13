import { msg } from '@/lib/i18n/translate'

import { classNames, defaultQuery, featureNames, playTennisDataset } from './dataset'
import type { FeatureName, NBExample } from './dataset'
import { cloneState } from './types'
import type { ClassResult, NBState, NBStep } from './types'

export const naiveBayesPseudocode = [
  'for each class c in classes',
  '    prior(c) ← count(class = c) / totalExamples',
  '    for each feature f in query',
  '        likelihood(f, c) ← count(f = value, class = c) / count(class = c)',
  '    posterior(c) ← prior(c) × Π likelihood(f, c)',
  'normalize posterior(c) across all classes',
  'predictedClass ← argmax_c posterior(c)',
  'return predictedClass',
]

function newResult(className: string, classCount: number, totalCount: number): ClassResult {
  return {
    className,
    classCount,
    totalCount,
    prior: classCount / totalCount,
    likelihoods: [],
    posterior: 1,
    posteriorComputed: false,
    normalized: null,
  }
}

export function runNaiveBayes(
  dataset: NBExample[] = playTennisDataset,
  query: Record<FeatureName, string> = defaultQuery,
): NBStep[] {
  const steps: NBStep[] = []
  const total = dataset.length
  const queryList = featureNames.map((feature) => ({ feature, value: query[feature] }))

  const results: Record<string, ClassResult> = {}
  for (const className of classNames) {
    const classCount = dataset.filter((row) => row.play === className).length
    results[className] = newResult(className, classCount, total)
  }

  const state: NBState = {
    query: queryList,
    classNames: [...classNames],
    results,
    currentClass: null,
    currentFeatureIndex: null,
    predictedClass: null,
    done: false,
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 1,
    explanation: msg('naiveBayes.init', {
      count: total,
      query: queryList.map((q) => `${q.feature}=${q.value}`).join(', '),
    }),
    traceEntry: msg('naiveBayes.init.trace', { count: total }),
  })

  for (const className of classNames) {
    state.currentClass = className
    state.currentFeatureIndex = null
    const result = state.results[className]

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 2,
      explanation: msg('naiveBayes.prior', {
        class: className,
        count: result.classCount,
        total,
        prior: result.prior.toFixed(3),
      }),
      traceEntry: msg('naiveBayes.prior.trace', { class: className, prior: result.prior.toFixed(3) }),
    })

    for (let i = 0; i < queryList.length; i++) {
      const { feature, value } = queryList[i]
      state.currentFeatureIndex = i
      const matching = dataset.filter((row) => row.play === className && row[feature] === value).length
      const probability = matching / result.classCount
      result.likelihoods.push({
        feature,
        value,
        matchingCount: matching,
        classCount: result.classCount,
        probability,
      })

      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 4,
        explanation: msg('naiveBayes.likelihood', {
          feature,
          value,
          class: className,
          count: matching,
          classCount: result.classCount,
          probability: probability.toFixed(3),
        }),
        traceEntry: msg('naiveBayes.likelihood.trace', {
          feature,
          class: className,
          probability: probability.toFixed(3),
        }),
      })
    }

    state.currentFeatureIndex = null
    result.posterior = result.likelihoods.reduce((acc, l) => acc * l.probability, result.prior)
    result.posteriorComputed = true

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 5,
      explanation: msg('naiveBayes.posterior', {
        class: className,
        posterior: result.posterior.toFixed(5),
      }),
      traceEntry: msg('naiveBayes.posterior.trace', {
        class: className,
        posterior: result.posterior.toFixed(5),
      }),
    })
    state.currentClass = null
  }

  const sum = classNames.reduce((acc, c) => acc + state.results[c].posterior, 0)
  for (const className of classNames) {
    state.results[className].normalized = sum > 0 ? state.results[className].posterior / sum : 0
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 6,
    explanation: msg('naiveBayes.normalize', {
      pYes: ((state.results.Yes.normalized ?? 0) * 100).toFixed(1),
      pNo: ((state.results.No.normalized ?? 0) * 100).toFixed(1),
    }),
    traceEntry: msg('naiveBayes.normalize.trace'),
  })

  const predicted = classNames.reduce((best, c) =>
    state.results[c].posterior > state.results[best].posterior ? c : best,
  )
  state.predictedClass = predicted
  state.done = true

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 7,
    explanation: msg('naiveBayes.predict', {
      class: predicted,
      posterior: state.results[predicted].posterior.toFixed(5),
    }),
    traceEntry: msg('naiveBayes.predict.trace', { class: predicted }),
  })

  return steps
}

import { msg } from '@/lib/i18n/translate'

import { classNames, K, knnDataset, knnQuery } from './dataset'
import { cloneState, euclideanDistance } from './types'
import type { KNNState, KNNStep, NeighborEntry } from './types'

export const knnPseudocode = [
  'for each point p in the training set',
  '    distance(p) ← euclideanDistance(query, p)',
  'sort the training set by distance, ascending',
  'neighbors ← the k closest points',
  'for each class c',
  '    votes(c) ← number of neighbors with class = c',
  'predictedClass ← argmax_c votes(c)',
  'return predictedClass',
]

export function runKNN(): KNNStep[] {
  const steps: KNNStep[] = []

  const points: NeighborEntry[] = knnDataset.map((point) => ({
    point,
    distance: null,
    isNeighbor: false,
  }))

  const votes: Record<string, number> = {}
  for (const name of classNames) votes[name] = 0

  const state: KNNState = {
    query: { ...knnQuery },
    k: K,
    classNames: [...classNames],
    points,
    sorted: false,
    votes,
    currentPointId: null,
    currentClass: null,
    predictedClass: null,
    done: false,
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 1,
    explanation: msg('knn.init', {
      count: knnDataset.length,
      x: knnQuery.x,
      y: knnQuery.y,
      k: K,
    }),
    traceEntry: msg('knn.init.trace', { count: knnDataset.length, k: K }),
  })

  for (const entry of state.points) {
    state.currentPointId = entry.point.id
    entry.distance = euclideanDistance(state.query, entry.point)

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 2,
      explanation: msg('knn.distance', {
        point: entry.point.id,
        x: entry.point.x,
        y: entry.point.y,
        distance: entry.distance.toFixed(2),
      }),
      traceEntry: msg('knn.distance.trace', { point: entry.point.id, distance: entry.distance.toFixed(2) }),
    })
  }
  state.currentPointId = null

  state.points = [...state.points].sort((a, b) => (a.distance as number) - (b.distance as number))
  state.sorted = true

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 3,
    explanation: msg('knn.sort', { closest: state.points[0].point.id }),
    traceEntry: msg('knn.sort.trace'),
  })

  const neighbors = state.points.slice(0, K)
  for (const entry of neighbors) entry.isNeighbor = true

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 4,
    explanation: msg('knn.selectNeighbors', {
      k: K,
      list: neighbors.map((n) => `${n.point.id} (${(n.distance as number).toFixed(2)})`).join(', '),
    }),
    traceEntry: msg('knn.selectNeighbors.trace', { k: K }),
  })

  for (const className of classNames) {
    state.currentClass = className
    const count = neighbors.filter((n) => n.point.label === className).length
    state.votes[className] = count

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 6,
      explanation: msg('knn.vote', { class: className, count, k: K }),
      traceEntry: msg('knn.vote.trace', { class: className, count }),
    })
  }
  state.currentClass = null

  const predicted = classNames.reduce((best, c) => (state.votes[c] > state.votes[best] ? c : best))
  state.predictedClass = predicted
  state.done = true

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 7,
    explanation: msg('knn.predict', {
      class: predicted,
      votes: state.votes[predicted],
      k: K,
    }),
    traceEntry: msg('knn.predict.trace', { class: predicted }),
  })

  return steps
}

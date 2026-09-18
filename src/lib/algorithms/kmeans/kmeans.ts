import { msg } from '@/lib/i18n/translate'

import { initialCentroids, K, kmeansDataset, MAX_ITERATIONS } from './dataset'
import { cloneState, euclideanDistance } from './types'
import type { Centroid, ClusteredPoint, KMeansState, KMeansStep } from './types'

export const kmeansPseudocode = [
  'initialize k centroids (fixed starting positions)',
  'while iteration < maxIterations and not converged',
  '    for each point p, assign p to the nearest centroid',
  '    if no point changed cluster this round, converged ← true',
  '    for each centroid c, recompute c as the mean of its assigned points',
  '    iteration ← iteration + 1',
  'return final centroids and cluster assignments',
]

function nearestCentroid(point: { x: number; y: number }, centroids: Centroid[]): number {
  let best = 0
  let bestDistance = Infinity
  centroids.forEach((c, i) => {
    const d = euclideanDistance(point, c)
    if (d < bestDistance) {
      bestDistance = d
      best = i
    }
  })
  return best
}

export function runKMeans(): KMeansStep[] {
  const steps: KMeansStep[] = []

  const points: ClusteredPoint[] = kmeansDataset.map((point) => ({ point, cluster: -1 }))

  const state: KMeansState = {
    iteration: 1,
    maxIterations: MAX_ITERATIONS,
    k: K,
    points,
    centroids: initialCentroids.map((c) => ({ ...c })),
    changedCount: null,
    converged: false,
    done: false,
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 1,
    explanation: msg('kmeans.init', { k: K, count: kmeansDataset.length }),
    traceEntry: msg('kmeans.init.trace', { k: K }),
  })

  while (state.iteration <= MAX_ITERATIONS && !state.converged) {
    let changed = 0
    state.points = state.points.map((entry) => {
      const cluster = nearestCentroid(entry.point, state.centroids)
      if (cluster !== entry.cluster) changed += 1
      return { point: entry.point, cluster }
    })
    state.changedCount = changed

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 3,
      explanation: msg('kmeans.assign', { iteration: state.iteration, changed }),
      traceEntry: msg('kmeans.assign.trace', { iteration: state.iteration, changed }),
    })

    if (changed === 0) {
      state.converged = true
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 4,
        explanation: msg('kmeans.converged', { iteration: state.iteration }),
        traceEntry: msg('kmeans.converged.trace'),
      })
      break
    }

    state.centroids = state.centroids.map((centroid, ci) => {
      const members = state.points.filter((p) => p.cluster === ci)
      if (members.length === 0) return centroid
      return {
        x: members.reduce((sum, m) => sum + m.point.x, 0) / members.length,
        y: members.reduce((sum, m) => sum + m.point.y, 0) / members.length,
      }
    })

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 5,
      explanation: msg('kmeans.recompute', {
        iteration: state.iteration,
        list: state.centroids.map((c, i) => `C${i + 1}=(${c.x.toFixed(2)}, ${c.y.toFixed(2)})`).join(', '),
      }),
      traceEntry: msg('kmeans.recompute.trace', { iteration: state.iteration }),
    })

    state.iteration += 1
  }

  state.done = true
  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 7,
    explanation: state.converged
      ? msg('kmeans.result.converged', { iteration: state.iteration })
      : msg('kmeans.result.exhausted', { iteration: state.iteration }),
    traceEntry: state.converged
      ? msg('kmeans.result.converged.trace')
      : msg('kmeans.result.exhausted.trace'),
  })

  return steps
}

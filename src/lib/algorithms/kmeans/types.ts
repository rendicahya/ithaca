import type { Message } from '@/lib/i18n/translate'

import type { RawPoint } from './dataset'

export interface ClusteredPoint {
  point: RawPoint
  cluster: number
}

export interface Centroid {
  x: number
  y: number
}

export interface KMeansState {
  iteration: number
  maxIterations: number
  k: number
  points: ClusteredPoint[]
  centroids: Centroid[]
  /** Points reassigned in the most recent assignment step, or null before the first one. */
  changedCount: number | null
  converged: boolean
  done: boolean
}

export interface KMeansStep {
  state: KMeansState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
}

export function euclideanDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function cloneState(state: KMeansState): KMeansState {
  return {
    ...state,
    points: state.points.map((p) => ({ ...p, point: { ...p.point } })),
    centroids: state.centroids.map((c) => ({ ...c })),
  }
}

import type { Message } from '@/lib/i18n/translate'

import type { DataPoint } from './dataset'

export interface NeighborEntry {
  point: DataPoint
  /** Euclidean distance to the query point, or null before it's computed. */
  distance: number | null
  /** Whether this point is among the k nearest — only meaningful once selected. */
  isNeighbor: boolean
}

export interface KNNState {
  query: { x: number; y: number }
  k: number
  classNames: string[]
  /** In dataset order until sorted, then ascending by distance. */
  points: NeighborEntry[]
  sorted: boolean
  votes: Record<string, number>
  currentPointId: string | null
  currentClass: string | null
  predictedClass: string | null
  done: boolean
}

export interface KNNStep {
  state: KNNState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
}

export function cloneState(state: KNNState): KNNState {
  return {
    ...state,
    query: { ...state.query },
    classNames: [...state.classNames],
    points: state.points.map((entry) => ({ ...entry, point: { ...entry.point } })),
    votes: { ...state.votes },
  }
}

export function euclideanDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

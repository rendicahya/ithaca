import type { Message } from '@/lib/i18n/translate'

import type { Criterion, Preferences } from './catalog'

export type Constraint = 'budget' | 'ram' | 'formFactor'

export interface AlternativeStatus {
  /** The user constraint that removed this product, or null while it is still a candidate. */
  eliminatedBy: Constraint | null
  /** Normalized value (0–1) per criterion; set once the product is scored. */
  normalized: Record<Criterion, number> | null
  score: number | null
  rank: number | null
}

export interface DSSState {
  preferences: Preferences
  weights: Record<Criterion, number>
  status: Record<string, AlternativeStatus>
  activeConstraint: Constraint | null
  currentProductId: string | null
  /** Best value per criterion among the remaining candidates (min for cost, max for benefit). */
  reference: Record<Criterion, number> | null
  ranked: boolean
  done: boolean
}

export interface DSSStep {
  state: DSSState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
}

export function cloneState(state: DSSState): DSSState {
  const status: Record<string, AlternativeStatus> = {}
  for (const [id, s] of Object.entries(state.status)) {
    status[id] = { ...s, normalized: s.normalized ? { ...s.normalized } : null }
  }
  return {
    ...state,
    preferences: { ...state.preferences },
    weights: { ...state.weights },
    status,
    reference: state.reference ? { ...state.reference } : null,
  }
}

import type { Message } from '@/lib/i18n/translate'

import type { FeatureName } from './dataset'

export interface LikelihoodTerm {
  feature: FeatureName
  value: string
  matchingCount: number
  classCount: number
  probability: number
}

export interface ClassResult {
  className: string
  classCount: number
  totalCount: number
  prior: number
  likelihoods: LikelihoodTerm[]
  /** prior × Π likelihoods — meaningful only once posteriorComputed is true. */
  posterior: number
  posteriorComputed: boolean
  normalized: number | null
}

export interface NBState {
  query: { feature: FeatureName; value: string }[]
  classNames: string[]
  results: Record<string, ClassResult>
  currentClass: string | null
  currentFeatureIndex: number | null
  predictedClass: string | null
  done: boolean
}

export interface NBStep {
  state: NBState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
}

export function cloneState(state: NBState): NBState {
  const results: Record<string, ClassResult> = {}
  for (const [name, r] of Object.entries(state.results)) {
    results[name] = { ...r, likelihoods: r.likelihoods.map((l) => ({ ...l })) }
  }
  return { ...state, query: [...state.query], results }
}

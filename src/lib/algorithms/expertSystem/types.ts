import type { Message } from '@/lib/i18n/translate'

import type { Answers, ConclusionRuleId, FactorId, RiskLevel } from './scorecard'

export interface RuleCheck {
  rule: ConclusionRuleId
  fired: boolean
}

export interface ESState {
  /** Working memory: the patient's answer (fact) for every risk factor. */
  answers: Answers
  /** Factors whose scoring rule has already fired, in evaluation order. */
  scoredFactors: FactorId[]
  currentFactor: FactorId | null
  score: Record<RiskLevel, number>
  /** Conclusion rules checked so far, in order. */
  ruleChecks: RuleCheck[]
  conclusion: RiskLevel | null
  done: boolean
}

export interface ESStep {
  state: ESState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
}

export function cloneState(state: ESState): ESState {
  return {
    ...state,
    answers: { ...state.answers },
    scoredFactors: [...state.scoredFactors],
    score: { ...state.score },
    ruleChecks: state.ruleChecks.map((c) => ({ ...c })),
  }
}

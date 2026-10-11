/**
 * Knowledge base of the National Stroke Association's Stroke Risk Scorecard.
 * Each risk factor has exactly one answer per column, so every answer the
 * patient gives is a fact that matches exactly one scoring rule.
 */
export type RiskLevel = 'high' | 'caution' | 'low'

/** Display order of the columns: lowest risk on the left, highest on the right. */
export const riskLevels: RiskLevel[] = ['low', 'caution', 'high']

export type FactorId =
  | 'bloodPressure'
  | 'atrialFibrillation'
  | 'smoking'
  | 'cholesterol'
  | 'diabetes'
  | 'physicalActivity'
  | 'weight'
  | 'strokeInFamily'

export const factorIds: FactorId[] = [
  'bloodPressure',
  'atrialFibrillation',
  'smoking',
  'cholesterol',
  'diabetes',
  'physicalActivity',
  'weight',
  'strokeInFamily',
]

export type Answers = Record<FactorId, RiskLevel>

/** Dictionary key for a factor's name. */
export function factorKey(factor: FactorId): string {
  return `expertSystem.factor.${factor}`
}

/** Dictionary key for the answer printed in a factor's cell of the given column. */
export function optionKey(factor: FactorId, level: RiskLevel): string {
  return `expertSystem.option.${factor}.${level}`
}

export type ConclusionRuleId = 'r1' | 'r2' | 'r3' | 'default'

export interface ConclusionRule {
  id: ConclusionRuleId
  /** The risk level concluded when this rule fires. */
  conclusion: RiskLevel
  condition: (score: Record<RiskLevel, number>) => boolean
}

/**
 * The stroke risk levels from the back of the scorecard, checked in order.
 * High risk is checked first: when the evidence is mixed, an expert errs on
 * the side of safety. The default rule is not on the card — it makes the
 * knowledge base's gap visible instead of silently returning nothing.
 */
export const conclusionRules: ConclusionRule[] = [
  { id: 'r1', conclusion: 'high', condition: (s) => s.high >= 3 },
  { id: 'r2', conclusion: 'caution', condition: (s) => s.caution >= 4 && s.caution <= 6 },
  { id: 'r3', conclusion: 'low', condition: (s) => s.low >= 6 && s.low <= 8 },
  { id: 'default', conclusion: 'caution', condition: () => true },
]

/** Dictionary key for a conclusion rule's condition, e.g. "High ≥ 3". */
export function conditionKey(rule: ConclusionRuleId): string {
  return `expertSystem.condition.${rule}`
}

export type PatientId = 'a' | 'b' | 'c' | 'd'

export interface PatientProfile {
  id: PatientId
  answers: Answers
}

export const patientProfiles: PatientProfile[] = [
  {
    // High 4, Caution 3, Low 1 → R1 fires immediately.
    id: 'a',
    answers: {
      bloodPressure: 'high',
      atrialFibrillation: 'caution',
      smoking: 'high',
      cholesterol: 'high',
      diabetes: 'caution',
      physicalActivity: 'high',
      weight: 'caution',
      strokeInFamily: 'low',
    },
  },
  {
    // High 0, Caution 5, Low 3 → R1 fails, R2 fires.
    id: 'b',
    answers: {
      bloodPressure: 'caution',
      atrialFibrillation: 'low',
      smoking: 'caution',
      cholesterol: 'caution',
      diabetes: 'low',
      physicalActivity: 'caution',
      weight: 'caution',
      strokeInFamily: 'low',
    },
  },
  {
    // High 0, Caution 2, Low 6 → R1, R2 fail, R3 fires.
    id: 'c',
    answers: {
      bloodPressure: 'low',
      atrialFibrillation: 'low',
      smoking: 'low',
      cholesterol: 'caution',
      diabetes: 'low',
      physicalActivity: 'low',
      weight: 'low',
      strokeInFamily: 'caution',
    },
  },
  {
    // High 2, Caution 3, Low 3 → no rule on the card fires; the default rule does.
    id: 'd',
    answers: {
      bloodPressure: 'high',
      atrialFibrillation: 'low',
      smoking: 'caution',
      cholesterol: 'high',
      diabetes: 'low',
      physicalActivity: 'caution',
      weight: 'caution',
      strokeInFamily: 'low',
    },
  },
]

export const defaultAnswers: Answers = patientProfiles[0].answers

export function sameAnswers(a: Answers, b: Answers): boolean {
  return factorIds.every((f) => a[f] === b[f])
}

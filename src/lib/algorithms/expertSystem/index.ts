export {
  conclusionRules,
  conditionKey,
  defaultAnswers,
  factorIds,
  factorKey,
  optionKey,
  patientProfiles,
  riskLevels,
  sameAnswers,
} from './scorecard'
export type {
  Answers,
  ConclusionRule,
  ConclusionRuleId,
  FactorId,
  PatientId,
  PatientProfile,
  RiskLevel,
} from './scorecard'
export { expertSystemPseudocode, runStrokeExpertSystem } from './expertSystem'
export type { ESState, ESStep, RuleCheck } from './types'

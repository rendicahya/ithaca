import { msg } from '@/lib/i18n/translate'

import { conclusionRules, conditionKey, defaultAnswers, factorIds, factorKey, optionKey } from './scorecard'
import type { Answers, RiskLevel } from './scorecard'
import { cloneState } from './types'
import type { ESState, ESStep } from './types'

export const expertSystemPseudocode = [
  'facts ← patient answers                     // working memory',
  'score ← { Low: 0, Caution: 0, High: 0 }',
  'for each risk factor f in the scorecard',
  '    IF fact(f) is in column X THEN score[X] ← score[X] + 1',
  'R1: if score[High] ≥ 3 then',
  '        return High risk',
  'R2: else if 4 ≤ score[Caution] ≤ 6 then',
  '        return Caution',
  'R3: else if 6 ≤ score[Low] ≤ 8 then',
  '        return Low risk',
  '    else return Caution                      // default: no rule fired',
]

/** Pseudocode line of each conclusion rule's condition and of its "return". */
const ruleLines = {
  r1: { check: 5, conclude: 6 },
  r2: { check: 7, conclude: 8 },
  r3: { check: 9, conclude: 10 },
  default: { check: 11, conclude: 11 },
} as const

function levelMsg(level: RiskLevel) {
  return msg(`expertSystem.level.${level}`)
}

/**
 * Forward-chaining inference over the Stroke Risk Scorecard: first every
 * scoring rule ("IF answer is in column X THEN X + 1") fires on its fact,
 * then the conclusion rules are checked in priority order until one fires.
 */
export function runStrokeExpertSystem(answers: Answers = defaultAnswers): ESStep[] {
  const steps: ESStep[] = []
  const state: ESState = {
    answers: { ...answers },
    scoredFactors: [],
    currentFactor: null,
    score: { high: 0, caution: 0, low: 0 },
    ruleChecks: [],
    conclusion: null,
    done: false,
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 1,
    explanation: msg('expertSystem.init', { count: factorIds.length }),
    traceEntry: msg('expertSystem.init.trace', { count: factorIds.length }),
  })

  for (const factor of factorIds) {
    const level = answers[factor]
    state.currentFactor = factor
    state.score[level] += 1
    state.scoredFactors.push(factor)

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 4,
      explanation: msg('expertSystem.score', {
        factor: msg(factorKey(factor)),
        answer: msg(optionKey(factor, level)),
        level: levelMsg(level),
        total: state.score[level],
      }),
      traceEntry: msg('expertSystem.score.trace', {
        factor: msg(factorKey(factor)),
        level: levelMsg(level),
      }),
    })
  }

  state.currentFactor = null

  for (const rule of conclusionRules) {
    const fired = rule.condition(state.score)
    state.ruleChecks.push({ rule: rule.id, fired })
    const scoreParams = { high: state.score.high, caution: state.score.caution, low: state.score.low }

    if (!fired) {
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: ruleLines[rule.id].check,
        explanation: msg('expertSystem.ruleFails', {
          rule: rule.id.toUpperCase(),
          condition: msg(conditionKey(rule.id)),
          ...scoreParams,
        }),
        traceEntry: msg('expertSystem.ruleFails.trace', { rule: rule.id.toUpperCase() }),
      })
      continue
    }

    state.conclusion = rule.conclusion
    state.done = true
    const isDefault = rule.id === 'default'
    steps.push({
      state: cloneState(state),
      activePseudocodeLine: ruleLines[rule.id].conclude,
      explanation: isDefault
        ? msg('expertSystem.defaultFires', { level: levelMsg(rule.conclusion), ...scoreParams })
        : msg('expertSystem.ruleFires', {
            rule: rule.id.toUpperCase(),
            condition: msg(conditionKey(rule.id)),
            level: levelMsg(rule.conclusion),
            advice: msg(`expertSystem.advice.${rule.conclusion}`),
            ...scoreParams,
          }),
      traceEntry: isDefault
        ? msg('expertSystem.defaultFires.trace', { level: levelMsg(rule.conclusion) })
        : msg('expertSystem.ruleFires.trace', { rule: rule.id.toUpperCase(), level: levelMsg(rule.conclusion) }),
    })
    break
  }

  return steps
}

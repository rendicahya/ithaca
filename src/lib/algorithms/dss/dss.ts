import { msg } from '@/lib/i18n/translate'
import type { Message } from '@/lib/i18n/translate'

import {
  catalog,
  costCriteria,
  criteria,
  criterionValue,
  defaultPreferences,
  formatRupiah,
  priorityWeights,
} from './catalog'
import type { Criterion, Preferences, Product } from './catalog'
import { cloneState } from './types'
import type { AlternativeStatus, Constraint, DSSState, DSSStep } from './types'

export const dssPseudocode = [
  'A ← all products in the database',
  'for each user constraint c (budget, RAM, form factor)',
  '    A ← { a ∈ A | a satisfies c }',
  'best[k] ← best value of criterion k in A',
  'for each alternative a in A',
  '    score(a) ← Σ w[k] × normalize(a[k], best[k])',
  'rank A by score (highest first)',
  'show the ranking — the user makes the final decision',
]

interface ConstraintCheck {
  id: Constraint
  isActive: (p: Preferences) => boolean
  satisfies: (product: Product, p: Preferences) => boolean
  describe: (p: Preferences) => Message
}

const constraintChecks: ConstraintCheck[] = [
  {
    id: 'budget',
    isActive: (p) => p.maxBudget !== null,
    satisfies: (a, p) => a.price <= (p.maxBudget ?? Infinity),
    describe: (p) => msg('dss.constraint.budget', { value: formatRupiah(p.maxBudget ?? 0) }),
  },
  {
    id: 'ram',
    isActive: (p) => p.minRam !== null,
    satisfies: (a, p) => a.ramGB >= (p.minRam ?? 0),
    describe: (p) => msg('dss.constraint.ram', { value: p.minRam ?? 0 }),
  },
  {
    id: 'formFactor',
    isActive: (p) => p.formFactor !== null,
    satisfies: (a, p) => a.formFactor === p.formFactor,
    describe: (p) => msg('dss.constraint.formFactor', { value: msg(`dss.formFactor.${p.formFactor}`) }),
  },
]

/** Simple Additive Weighting normalization: cost criteria favour small values, benefit criteria large ones. */
function normalize(value: number, best: number, criterion: Criterion): number {
  if (costCriteria.includes(criterion)) return value === 0 ? 1 : best / value
  return best === 0 ? 0 : value / best
}

/**
 * A Decision Support System does not decide — it narrows and ranks the
 * options so the user can. Steps: apply each hard constraint the user set,
 * score the remaining products by Simple Additive Weighting with weights
 * from the user's priority, then present the ranking.
 */
export function runDSS(preferences: Preferences = defaultPreferences, products: Product[] = catalog): DSSStep[] {
  const steps: DSSStep[] = []
  const weights = priorityWeights[preferences.priority]

  const status: Record<string, AlternativeStatus> = {}
  for (const p of products) status[p.id] = { eliminatedBy: null, normalized: null, score: null, rank: null }

  const state: DSSState = {
    preferences: { ...preferences },
    weights: { ...weights },
    status,
    activeConstraint: null,
    currentProductId: null,
    reference: null,
    ranked: false,
    done: false,
  }

  const candidates = () => products.filter((p) => state.status[p.id].eliminatedBy === null)

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 1,
    explanation: msg('dss.init', { count: products.length }),
    traceEntry: msg('dss.init.trace', { count: products.length }),
  })

  for (const check of constraintChecks) {
    if (!check.isActive(preferences)) continue
    state.activeConstraint = check.id
    const removed = candidates().filter((p) => !check.satisfies(p, preferences))
    for (const p of removed) state.status[p.id].eliminatedBy = check.id
    const remaining = candidates().length

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 3,
      explanation:
        removed.length === 0
          ? msg('dss.filterNone', { constraint: check.describe(preferences), remaining })
          : msg('dss.filter', {
              constraint: check.describe(preferences),
              removed: removed.map((p) => p.name).join(', '),
              remaining,
            }),
      traceEntry: msg('dss.filter.trace', {
        constraint: check.describe(preferences),
        removed: removed.length,
      }),
    })
  }
  state.activeConstraint = null

  const remaining = candidates()
  if (remaining.length === 0) {
    state.done = true
    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 8,
      explanation: msg('dss.noneLeft'),
      traceEntry: msg('dss.noneLeft.trace'),
    })
    return steps
  }

  const reference = {} as Record<Criterion, number>
  for (const k of criteria) {
    const values = remaining.map((p) => criterionValue(p, k))
    reference[k] = costCriteria.includes(k) ? Math.min(...values) : Math.max(...values)
  }
  state.reference = reference

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 4,
    explanation: msg('dss.reference', {
      price: formatRupiah(reference.price),
      cpu: reference.cpu,
      ram: reference.ram,
      rating: reference.rating.toFixed(1),
    }),
    traceEntry: msg('dss.reference.trace'),
  })

  for (const p of remaining) {
    const normalized = {} as Record<Criterion, number>
    for (const k of criteria) normalized[k] = normalize(criterionValue(p, k), reference[k], k)
    const score = criteria.reduce((sum, k) => sum + weights[k] * normalized[k], 0)
    state.currentProductId = p.id
    state.status[p.id].normalized = normalized
    state.status[p.id].score = score

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 6,
      explanation: msg('dss.score', {
        name: p.name,
        terms: criteria.map((k) => `${weights[k]}×${normalized[k].toFixed(2)}`).join(' + '),
        score: score.toFixed(3),
      }),
      traceEntry: msg('dss.score.trace', { name: p.name, score: score.toFixed(3) }),
    })
  }
  state.currentProductId = null

  // Ties keep catalog order so the ranking is deterministic.
  const ranking = [...remaining].sort((a, b) => (state.status[b.id].score ?? 0) - (state.status[a.id].score ?? 0))
  ranking.forEach((p, i) => (state.status[p.id].rank = i + 1))
  state.ranked = true

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 7,
    explanation: msg('dss.rank', {
      ranking: ranking.map((p, i) => `${i + 1}. ${p.name}`).join(', '),
    }),
    traceEntry: msg('dss.rank.trace'),
  })

  state.done = true
  const top = ranking[0]
  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 8,
    explanation: msg('dss.recommend', { name: top.name, score: (state.status[top.id].score ?? 0).toFixed(3) }),
    traceEntry: msg('dss.recommend.trace', { name: top.name }),
  })

  return steps
}

import type { Message } from '@/lib/i18n/translate'

import type { Classifier, DataPoint, Label, Stump, Vec } from './models'

export type EnsembleMethodId = 'bagging' | 'boosting' | 'stacking'

/** Shared by all three methods: what the scatter plot draws. */
interface EnsembleStateBase {
  points: DataPoint[]
  query: Vec
  /**
   * False during training: the query point only appears once the algorithm
   * actually evaluates the trained model(s) on it, so students don't read it
   * as part of the training data.
   */
  queryVisible: boolean
  /** The classifier whose decision regions are shaded, or null for none. */
  focus: Classifier | null
  /** Caption for the shaded region, e.g. "h₂: y ≤ 6.00 → +1". */
  focusCaption: Message | null
  /** Ids of training points the focus classifier gets wrong. */
  misclassified: string[]
  /** Final ensemble prediction for the query point. */
  prediction: Label | null
  done: boolean
}

export interface BaggingModel {
  stump: Stump
  /** How many times each training point (by dataset index) was drawn into this model's bootstrap sample. */
  counts: number[]
  /** Correct predictions on the full original dataset. */
  correct: number
  /** This model's vote for the query point, once collected. */
  vote: Label | null
}

export interface BaggingState extends EnsembleStateBase {
  method: 'bagging'
  models: BaggingModel[]
  /** Index of the model being built, or null. */
  current: number | null
  /** Bootstrap multiplicities currently drawn on the plot (null = show the full dataset). */
  sampleCounts: number[] | null
  ensembleCorrect: number | null
}

export interface BoostingRound {
  stump: Stump
  error: number | null
  alpha: number | null
  vote: Label | null
  /** Training accuracy of the ensemble of rounds 1..t, once this round is complete. */
  ensembleCorrect: number | null
}

export interface BoostingState extends EnsembleStateBase {
  method: 'boosting'
  weights: number[]
  /** Weights before the most recent update, so the change can be shown. */
  previousWeights: number[] | null
  rounds: BoostingRound[]
  current: number | null
  /** F(x_query) = Σ αₜ·hₜ(x_query), once computed. */
  score: number | null
}

export type BaseModelKind = 'stump' | 'knn' | 'centroid'

export interface StackingBaseModel {
  kind: BaseModelKind
  /** The model trained on the full dataset (null until retrained). */
  classifier: Classifier | null
  correct: number | null
  vote: Label | null
}

export interface StackingState extends EnsembleStateBase {
  method: 'stacking'
  /** Fold index per training point. */
  folds: number[]
  foldCount: number
  /** Fold currently held out, or null. */
  currentFold: number | null
  /** Meta-training set: out-of-fold predictions (one per base model) per training point. */
  metaRows: (Label[] | null)[]
  baseModels: StackingBaseModel[]
  meta: { bias: number; weights: number[] } | null
  /** Meta-model accuracy on its own (out-of-fold) training rows. */
  metaCorrect: number | null
  /** P(y = +1) from the meta-model for the query, once computed. */
  probability: number | null
}

export type EnsembleState = BaggingState | BoostingState | StackingState

export interface EnsembleStep {
  state: EnsembleState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
}

export function snapshot<T extends EnsembleState>(state: T): T {
  return structuredClone(state)
}

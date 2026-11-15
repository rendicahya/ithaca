import { baggingPseudocode, runBagging } from './bagging'
import { boostingPseudocode, runBoosting } from './boosting'
import { runStacking, stackingPseudocode } from './stacking'
import type { EnsembleMethodId, EnsembleStep } from './types'

export interface EnsembleMethod {
  id: EnsembleMethodId
  nameKey: string
  pseudocode: string[]
  run: () => EnsembleStep[]
}

export const ensembleMethods: EnsembleMethod[] = [
  { id: 'bagging', nameKey: 'ensemble.method.bagging', pseudocode: baggingPseudocode, run: runBagging },
  { id: 'boosting', nameKey: 'ensemble.method.boosting', pseudocode: boostingPseudocode, run: runBoosting },
  { id: 'stacking', nameKey: 'ensemble.method.stacking', pseudocode: stackingPseudocode, run: runStacking },
]

export function getEnsembleMethod(id: EnsembleMethodId): EnsembleMethod {
  return ensembleMethods.find((m) => m.id === id) ?? ensembleMethods[0]
}

export { ENSEMBLE_BOUNDS, ensembleDataset, ensembleQuery } from './dataset'
export { formatNumber, formatStump } from './format'
export { boostingScore, formatLabel, predict } from './models'
export type { Classifier, DataPoint, Label, Stump } from './models'
export { baseModelShortName, STACKING_BASE_MODELS } from './stacking'
export type {
  BaggingState,
  BoostingState,
  EnsembleMethodId,
  EnsembleState,
  EnsembleStep,
  StackingState,
} from './types'

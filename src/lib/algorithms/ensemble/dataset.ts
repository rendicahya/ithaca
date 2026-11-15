import type { DataPoint, Label, Vec } from './models'

const point = (id: string, x: number, y: number, label: Label): DataPoint => ({ id, x, y, label })

/**
 * One shared 2D dataset for all three ensemble methods, so the lecturer can
 * compare them on identical data. Class +1 sits roughly bottom-left, but P5
 * (bottom-right) and P6 (top-left) break every single axis-aligned split:
 * no decision stump scores better than 8/10, which is exactly the gap the
 * ensembles are meant to close. AdaBoost needs four rounds to reach 10/10.
 */
export const ensembleDataset: DataPoint[] = [
  point('P1', 1.5, 2.0, 1),
  point('P2', 2.5, 5.0, 1),
  point('P3', 4.0, 3.0, 1),
  point('P4', 4.5, 5.5, 1),
  point('P5', 6.5, 1.5, 1),
  point('P6', 2.0, 8.0, -1),
  point('P7', 7.5, 3.5, -1),
  point('P8', 8.0, 6.5, -1),
  point('P9', 5.5, 8.5, -1),
  point('P10', 8.5, 1.0, -1),
]

/** Placed between the two classes, so the individual models disagree on it. */
export const ensembleQuery: Vec = { x: 5.5, y: 4.5 }

export const ENSEMBLE_BOUNDS = { min: 0, max: 10 }

/** Bagging: number of bootstrap models (odd, so the majority vote never ties). */
export const BAGGING_MODELS = 5
/** Chosen so the five bootstrap stumps differ and the vote is a close 3–2. */
export const BAGGING_SEED = 7

/** AdaBoost: number of boosting rounds T. */
export const BOOSTING_ROUNDS = 4

/** Stacking: number of cross-validation folds used to build the meta-training set. */
export const STACKING_FOLDS = 5
/** k for the k-NN base model. */
export const STACKING_KNN_K = 3

/**
 * The small classifiers combined by the ensemble demos. Everything here is
 * pure and deterministic so the precomputed execution steps can reference
 * classifiers as plain data, and the view can re-evaluate them to shade the
 * decision regions.
 */

/** Class labels follow the AdaBoost slides: y ∈ {−1, +1}. */
export type Label = 1 | -1

export interface Vec {
  x: number
  y: number
}

export interface DataPoint extends Vec {
  id: string
  label: Label
}

export type Feature = 'x' | 'y'

/** A depth-1 decision tree: `feature ≤ threshold → below`, otherwise the other class. */
export interface Stump {
  feature: Feature
  threshold: number
  below: Label
}

export type Classifier =
  | { kind: 'stump'; stump: Stump }
  | { kind: 'knn'; k: number; train: DataPoint[] }
  | { kind: 'centroid'; positive: Vec; negative: Vec }
  /** Bagging: unweighted majority vote. */
  | { kind: 'majority'; members: Stump[] }
  /** Boosting: sign(Σ αₜ·hₜ(x)). */
  | { kind: 'weighted'; members: Stump[]; alphas: number[] }
  /** Stacking: logistic-regression meta-model over the base models' votes. */
  | { kind: 'meta'; members: Classifier[]; bias: number; weights: number[] }

export function formatLabel(label: Label): string {
  return label === 1 ? '+1' : '−1'
}

export function predictStump(stump: Stump, p: Vec): Label {
  return p[stump.feature] <= stump.threshold ? stump.below : (-stump.below as Label)
}

export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z))
}

/** F(x) = Σ αₜ·hₜ(x) — the raw boosting score before taking the sign. */
export function boostingScore(members: Stump[], alphas: number[], p: Vec): number {
  return members.reduce((sum, stump, i) => sum + alphas[i] * predictStump(stump, p), 0)
}

/** P(y = +1 | z) from the stacking meta-model, where z is the base models' votes. */
export function metaProbability(bias: number, weights: number[], features: Label[]): number {
  return sigmoid(features.reduce((sum, f, i) => sum + weights[i] * f, bias))
}

export function predict(classifier: Classifier, p: Vec): Label {
  switch (classifier.kind) {
    case 'stump':
      return predictStump(classifier.stump, p)
    case 'knn': {
      const nearest = [...classifier.train]
        .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))
        .slice(0, classifier.k)
      const sum = nearest.reduce((s, n) => s + n.label, 0)
      return sum >= 0 ? 1 : -1
    }
    case 'centroid': {
      const dPos = Math.hypot(classifier.positive.x - p.x, classifier.positive.y - p.y)
      const dNeg = Math.hypot(classifier.negative.x - p.x, classifier.negative.y - p.y)
      return dPos <= dNeg ? 1 : -1
    }
    case 'majority': {
      const sum = classifier.members.reduce((s, m) => s + predictStump(m, p), 0)
      return sum >= 0 ? 1 : -1
    }
    case 'weighted':
      return boostingScore(classifier.members, classifier.alphas, p) >= 0 ? 1 : -1
    case 'meta': {
      const features = classifier.members.map((m) => predict(m, p))
      return metaProbability(classifier.bias, classifier.weights, features) >= 0.5 ? 1 : -1
    }
  }
}

/** Number of points the classifier gets right. */
export function countCorrect(classifier: Classifier, points: DataPoint[]): number {
  return points.filter((p) => predict(classifier, p) === p.label).length
}

/**
 * Exhaustive search for the stump with the smallest weighted error.
 * Thresholds are midpoints between consecutive distinct feature values, so
 * every candidate actually separates the data somewhere. Ties keep the first
 * candidate found (x before y, ascending threshold, +1 before −1), which
 * keeps the run deterministic.
 */
export function trainStump(points: DataPoint[], weights: number[]): { stump: Stump; error: number } {
  const total = weights.reduce((s, w) => s + w, 0)
  let best: { stump: Stump; error: number } | null = null

  for (const feature of ['x', 'y'] as const) {
    const values = [...new Set(points.map((p) => p[feature]))].sort((a, b) => a - b)
    for (let i = 0; i < values.length - 1; i++) {
      const threshold = (values[i] + values[i + 1]) / 2
      for (const below of [1, -1] as const) {
        const stump: Stump = { feature, threshold, below }
        let error = 0
        points.forEach((p, j) => {
          if (predictStump(stump, p) !== p.label) error += weights[j]
        })
        error /= total
        if (!best || error < best.error - 1e-12) best = { stump, error }
      }
    }
  }

  if (!best) throw new Error('trainStump needs at least two distinct feature values')
  return best
}

export function trainCentroid(points: DataPoint[]): Classifier {
  const mean = (label: Label): Vec => {
    const members = points.filter((p) => p.label === label)
    return {
      x: members.reduce((s, p) => s + p.x, 0) / members.length,
      y: members.reduce((s, p) => s + p.y, 0) / members.length,
    }
  }
  return { kind: 'centroid', positive: mean(1), negative: mean(-1) }
}

const META_LEARNING_RATE = 0.5
const META_EPOCHS = 500
// A small L2 penalty keeps the weights finite: the meta-training set is tiny
// and often linearly separable, where unregularized logistic regression
// would grow its weights without bound.
const META_L2 = 0.05

/** Batch gradient descent on the mean log-loss (+ L2 on the weights, not the bias). */
export function trainLogisticRegression(
  features: Label[][],
  labels: Label[],
): { bias: number; weights: number[] } {
  const m = features[0].length
  let bias = 0
  const weights = new Array<number>(m).fill(0)

  for (let epoch = 0; epoch < META_EPOCHS; epoch++) {
    let gradBias = 0
    const gradWeights = new Array<number>(m).fill(0)
    features.forEach((row, i) => {
      const target = labels[i] === 1 ? 1 : 0
      const diff = metaProbability(bias, weights, row) - target
      gradBias += diff
      row.forEach((f, j) => (gradWeights[j] += diff * f))
    })
    const n = features.length
    bias -= (META_LEARNING_RATE * gradBias) / n
    for (let j = 0; j < m; j++) {
      weights[j] -= META_LEARNING_RATE * (gradWeights[j] / n + META_L2 * weights[j])
    }
  }

  return { bias, weights }
}

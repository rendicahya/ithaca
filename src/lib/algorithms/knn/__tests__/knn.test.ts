import { describe, expect, it } from 'vitest'

import { knnDataset } from '../dataset'
import { knnPseudocode, runKNN } from '../knn'

describe('runKNN', () => {
  const steps = runKNN()
  const last = steps[steps.length - 1]

  it('terminates', () => {
    expect(last.state.done).toBe(true)
  })

  it('predicts class A for the fixed query point and k', () => {
    // Hand-verified: the 3 nearest neighbors to (5, 5) are A5 (1.12), B2
    // (2.06), and A2 (2.50) — a 2-1 majority for class A.
    expect(last.state.predictedClass).toBe('A')
  })

  it('selects exactly k neighbors, all with the smallest distances', () => {
    const neighbors = last.state.points.filter((p) => p.isNeighbor)
    expect(neighbors).toHaveLength(last.state.k)
    const nonNeighbors = last.state.points.filter((p) => !p.isNeighbor)
    const maxNeighborDistance = Math.max(...neighbors.map((n) => n.distance as number))
    for (const n of nonNeighbors) {
      expect(n.distance as number).toBeGreaterThanOrEqual(maxNeighborDistance)
    }
  })

  it('vote counts among neighbors sum to k', () => {
    const total = Object.values(last.state.votes).reduce((sum, v) => sum + v, 0)
    expect(total).toBe(last.state.k)
  })

  it('computes a distance for every point in the dataset', () => {
    expect(last.state.points).toHaveLength(knnDataset.length)
    for (const entry of last.state.points) {
      expect(entry.distance).not.toBeNull()
      expect(entry.distance as number).toBeGreaterThan(0)
    }
  })

  it('leaves the training set sorted ascending by distance', () => {
    for (let i = 1; i < last.state.points.length; i++) {
      expect(last.state.points[i].distance as number).toBeGreaterThanOrEqual(
        last.state.points[i - 1].distance as number,
      )
    }
  })

  it('every step references a valid pseudocode line', () => {
    for (const step of steps) {
      expect(step.activePseudocodeLine).toBeGreaterThanOrEqual(1)
      expect(step.activePseudocodeLine).toBeLessThanOrEqual(knnPseudocode.length)
    }
  })
})

describe('runKNN — determinism', () => {
  it('produces an identical run every time', () => {
    const a = runKNN()
    const b = runKNN()
    expect(a.length).toBe(b.length)
    expect(a[a.length - 1].state.predictedClass).toBe(b[b.length - 1].state.predictedClass)
  })
})

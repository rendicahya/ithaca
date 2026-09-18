import { describe, expect, it } from 'vitest'

import { kmeansDataset } from '../dataset'
import { kmeansPseudocode, runKMeans } from '../kmeans'

describe('runKMeans', () => {
  const steps = runKMeans()
  const last = steps[steps.length - 1]

  it('terminates', () => {
    expect(last.state.done).toBe(true)
  })

  it('converges before exhausting the iteration budget', () => {
    expect(last.state.converged).toBe(true)
  })

  it('assigns every point to a valid cluster', () => {
    expect(last.state.points).toHaveLength(kmeansDataset.length)
    for (const p of last.state.points) {
      expect(p.cluster).toBeGreaterThanOrEqual(0)
      expect(p.cluster).toBeLessThan(last.state.k)
    }
  })

  it('separates the three known groups into three distinct clusters', () => {
    const clusterOf = (id: string) => last.state.points.find((p) => p.point.id === id)?.cluster
    // P1-P5 cluster near (2,2), P6-P10 near (8,2), P11-P15 near (5,8).
    const groupA = ['P1', 'P2', 'P3', 'P4', 'P5'].map(clusterOf)
    const groupB = ['P6', 'P7', 'P8', 'P9', 'P10'].map(clusterOf)
    const groupC = ['P11', 'P12', 'P13', 'P14', 'P15'].map(clusterOf)
    expect(new Set(groupA).size).toBe(1)
    expect(new Set(groupB).size).toBe(1)
    expect(new Set(groupC).size).toBe(1)
    expect(new Set([groupA[0], groupB[0], groupC[0]]).size).toBe(3)
  })

  it('never exceeds the configured maximum number of iterations', () => {
    expect(last.state.iteration).toBeLessThanOrEqual(last.state.maxIterations)
  })

  it('every step references a valid pseudocode line', () => {
    for (const step of steps) {
      expect(step.activePseudocodeLine).toBeGreaterThanOrEqual(1)
      expect(step.activePseudocodeLine).toBeLessThanOrEqual(kmeansPseudocode.length)
    }
  })
})

describe('runKMeans — determinism', () => {
  it('produces an identical run every time', () => {
    const a = runKMeans()
    const b = runKMeans()
    expect(a.length).toBe(b.length)
    expect(a[a.length - 1].state.centroids).toEqual(b[b.length - 1].state.centroids)
  })
})

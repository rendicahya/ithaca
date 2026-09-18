import { describe, expect, it } from 'vitest'

import { defaultGraph } from '@/lib/graph/defaultGraph'

import { acoPseudocode, runACO } from '../aco'

describe('runACO', () => {
  const steps = runACO()
  const last = steps[steps.length - 1]

  it('terminates', () => {
    expect(last.state.done).toBe(true)
  })

  it('finds a valid path from start to goal', () => {
    const path = last.state.globalBestPath
    expect(path).not.toBeNull()
    expect(path?.[0]).toBe(defaultGraph.start)
    expect(path?.[path.length - 1]).toBe(defaultGraph.goal)
  })

  it('finds the known-optimal path cost (11) on the shared weighted graph', () => {
    expect(last.state.globalBestCost).toBe(11)
  })

  it('never exceeds the configured maximum number of iterations', () => {
    expect(last.state.iteration).toBeLessThanOrEqual(last.state.maxIterations + 1)
  })

  it('every ant path only uses real edges of the graph', () => {
    for (const step of steps) {
      for (const ant of step.state.ants) {
        for (const edgeId of ant.edges) {
          expect(defaultGraph.edges.some((e) => e.id === edgeId)).toBe(true)
        }
      }
    }
  })

  it('keeps pheromone values positive at every step', () => {
    for (const step of steps) {
      for (const value of Object.values(step.state.pheromone)) {
        expect(value).toBeGreaterThan(0)
      }
    }
  })

  it('never regresses the global best cost across steps', () => {
    let previousBest = Infinity
    for (const step of steps) {
      if (step.state.globalBestCost !== null) {
        expect(step.state.globalBestCost).toBeLessThanOrEqual(previousBest)
        previousBest = step.state.globalBestCost
      }
    }
  })

  it('every step references a valid pseudocode line', () => {
    for (const step of steps) {
      expect(step.activePseudocodeLine).toBeGreaterThanOrEqual(1)
      expect(step.activePseudocodeLine).toBeLessThanOrEqual(acoPseudocode.length)
    }
  })
})

describe('runACO — determinism', () => {
  it('produces an identical run every time given the fixed seed', () => {
    const a = runACO()
    const b = runACO()
    expect(a.length).toBe(b.length)
    expect(a[a.length - 1].state.globalBestPath).toEqual(b[b.length - 1].state.globalBestPath)
  })
})

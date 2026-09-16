import { describe, expect, it } from 'vitest'

import { defaultGraph } from '../defaultGraph'
import { computeHeuristics } from '../heuristics'
import { treeGraph } from '../treeGraph'

describe('computeHeuristics', () => {
  it('matches treeGraph\'s hand-tuned heuristics for its original goal (exact tree-distance)', () => {
    const result = computeHeuristics(treeGraph, treeGraph.goal)
    for (const node of treeGraph.nodes) {
      expect(result[node.id]).toBe(node.heuristic)
    }
  })

  it('computes exact shortest-path cost to the goal on the weighted graph', () => {
    const result = computeHeuristics(defaultGraph, 'G')
    expect(result).toEqual({ S: 11, A: 10, B: 7, C: 7, D: 5, E: 3, F: 3, G: 0 })
  })

  it('is always admissible: h(n) never exceeds the true remaining cost', () => {
    const result = computeHeuristics(defaultGraph, 'G')
    // The hand-tuned values are themselves admissible lower bounds, so the
    // true shortest cost (what this function returns) must be >= them.
    for (const node of defaultGraph.nodes) {
      expect(result[node.id]).toBeGreaterThanOrEqual(node.heuristic)
    }
  })

  it('recomputes correctly for a goal other than the graph default', () => {
    const result = computeHeuristics(defaultGraph, 'A')
    expect(result.A).toBe(0)
    expect(result.S).toBe(2)
    expect(result.C).toBe(3)
  })

  it('gives an unreachable node a fallback of 0 rather than Infinity', () => {
    const isolated = {
      nodes: [
        { id: 'X', label: 'X', x: 0, y: 0, heuristic: 0 },
        { id: 'Y', label: 'Y', x: 0, y: 0, heuristic: 0 },
      ],
      edges: [],
      start: 'X',
      goal: 'Y',
    }
    const result = computeHeuristics(isolated, 'Y')
    expect(result.X).toBe(0)
    expect(result.Y).toBe(0)
  })
})

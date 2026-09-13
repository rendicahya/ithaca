import { describe, expect, it } from 'vitest'

import { defaultGraph } from '@/lib/graph/defaultGraph'

import { runAstar } from '../astar'

describe('A*', () => {
  const steps = runAstar(defaultGraph)
  const last = steps[steps.length - 1]

  it('terminates and finds the optimal-cost path despite a misleading heuristic', () => {
    expect(last.state.done).toBe(true)
    expect(last.state.found).toBe(true)
    expect(last.state.path).toEqual(['S', 'B', 'D', 'F', 'G'])
    expect(last.state.pathCost).toBe(11)
  })

  it('expands nodes in the expected f(n)-ordered sequence, with ties broken by h(n)', () => {
    const selectOrder = steps
      .filter((s) => s.traceEntry?.key === 'astar.select.trace')
      .map((s) => s.state.currentNode)
    expect(selectOrder).toEqual(['S', 'B', 'A', 'E', 'D', 'F', 'G'])
  })

  it('always reports f(n) = g(n) + h(n) for the current node', () => {
    for (const step of steps) {
      const { currentNode, gScore, hScore, fScore } = step.state
      if (currentNode && gScore?.[currentNode] !== undefined && hScore?.[currentNode] !== undefined) {
        expect(fScore?.[currentNode]).toBe(gScore[currentNode]! + hScore[currentNode]!)
      }
    }
  })
})

import { describe, expect, it } from 'vitest'

import { defaultGraph } from '@/lib/graph/defaultGraph'

import { runGreedy } from '../greedy'

describe('Greedy Best-First Search', () => {
  const steps = runGreedy(defaultGraph)
  const last = steps[steps.length - 1]

  it('terminates and finds a path, but not necessarily the optimal one', () => {
    expect(last.state.done).toBe(true)
    expect(last.state.found).toBe(true)
    // Misled by a deliberately low h(E) — ignores accumulated path cost.
    expect(last.state.path).toEqual(['S', 'B', 'E', 'G'])
    expect(last.state.pathCost).toBe(12)
    expect(last.state.pathCost).toBeGreaterThan(11) // not the UCS/A* optimum
  })

  it('always selects the frontier node with smallest h(n), ignoring g(n)', () => {
    const selectOrder = steps
      .filter((s) => s.traceEntry?.key === 'greedy.select.trace')
      .map((s) => s.state.currentNode)
    expect(selectOrder).toEqual(['S', 'B', 'E', 'G'])
  })
})

import { describe, expect, it } from 'vitest'

import { defaultGraph } from '@/lib/graph/defaultGraph'

import { runBfs } from '../bfs'

describe('BFS', () => {
  const steps = runBfs(defaultGraph)
  const last = steps[steps.length - 1]

  it('terminates and finds the goal', () => {
    expect(last.state.done).toBe(true)
    expect(last.state.found).toBe(true)
  })

  it('finds the fewest-edges path, not the cheapest one', () => {
    // Fewest edges (3), even though it is not the cheapest path (cost 15 vs. 11).
    expect(last.state.path).toEqual(['S', 'A', 'D', 'G'])
    expect(last.state.pathCost).toBe(15)
  })

  it('expands nodes in FIFO order', () => {
    const dequeueOrder = steps
      .filter((s) => s.traceEntry?.startsWith('Dequeue'))
      .map((s) => s.state.currentNode)
    expect(dequeueOrder).toEqual(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G'])
  })

  it('never dequeues the same node twice', () => {
    const dequeueOrder = steps
      .filter((s) => s.traceEntry?.startsWith('Dequeue'))
      .map((s) => s.state.currentNode)
    expect(new Set(dequeueOrder).size).toBe(dequeueOrder.length)
  })

  it('produces a step for backward/forward stepping with a defined pseudocode line', () => {
    for (const step of steps) {
      expect(step.activePseudocodeLine).toBeGreaterThan(0)
      expect(step.explanation.length).toBeGreaterThan(0)
    }
  })

  it('explicitly checks every dequeued non-goal node against the goal', () => {
    const checked = steps
      .filter((s) => s.traceEntry?.startsWith('Check'))
      .map((s) => s.state.currentNode)
    // Every node except the goal itself should get an explicit "not the goal" check.
    expect(checked).toEqual(['S', 'A', 'B', 'C', 'D', 'E', 'F'])
  })

  it('highlights newly discovered children as dashed expansion edges before committing them', () => {
    const expandSteps = steps.filter((s) => s.traceEntry?.startsWith('Expand'))
    expect(expandSteps.some((s) => s.state.expandingEdgeIds.length > 0)).toBe(true)
    // The highlight is cleared again once the children are committed to the frontier.
    const enqueueSteps = steps.filter((s) => s.traceEntry?.startsWith('Enqueue'))
    expect(enqueueSteps.every((s) => s.state.expandingEdgeIds.length === 0)).toBe(true)
  })
})

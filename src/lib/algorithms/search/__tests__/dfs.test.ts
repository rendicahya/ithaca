import { describe, expect, it } from 'vitest'

import { defaultGraph } from '@/lib/graph/defaultGraph'

import { runDfs } from '../dfs'

describe('DFS', () => {
  const steps = runDfs(defaultGraph)
  const last = steps[steps.length - 1]

  it('terminates and finds the goal', () => {
    expect(last.state.done).toBe(true)
    expect(last.state.found).toBe(true)
  })

  it('finds a valid but non-optimal path (depth-first order)', () => {
    expect(last.state.path).toEqual(['S', 'A', 'C', 'F', 'G'])
    expect(last.state.pathCost).toBe(12)
  })

  it('pops nodes in LIFO order', () => {
    const popOrder = steps
      .filter((s) => s.traceEntry?.startsWith('Pop'))
      .map((s) => s.state.currentNode)
    expect(popOrder).toEqual(['S', 'A', 'C', 'F', 'G'])
  })

  it('explicitly checks every popped non-goal node against the goal', () => {
    const checked = steps
      .filter((s) => s.traceEntry?.startsWith('Check'))
      .map((s) => s.state.currentNode)
    expect(checked).toEqual(['S', 'A', 'C', 'F'])
  })

  it('highlights newly discovered children as dashed expansion edges before committing them', () => {
    const expandSteps = steps.filter((s) => s.traceEntry?.startsWith('Expand'))
    expect(expandSteps.some((s) => s.state.expandingEdgeIds.length > 0)).toBe(true)
    const pushSteps = steps.filter((s) => s.traceEntry?.startsWith('Push'))
    expect(pushSteps.every((s) => s.state.expandingEdgeIds.length === 0)).toBe(true)
  })
})

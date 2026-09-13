import { describe, expect, it } from 'vitest'

import { defaultGraph } from '@/lib/graph/defaultGraph'

import { runUcs } from '../ucs'

describe('UCS', () => {
  const steps = runUcs(defaultGraph)
  const last = steps[steps.length - 1]

  it('terminates and finds the optimal-cost path', () => {
    expect(last.state.done).toBe(true)
    expect(last.state.found).toBe(true)
    expect(last.state.path).toEqual(['S', 'B', 'D', 'F', 'G'])
    expect(last.state.pathCost).toBe(11)
  })

  it('selects nodes in non-decreasing order of g(n)', () => {
    const selects = steps.filter((s) => s.traceEntry?.startsWith('Select'))
    const gValues = selects.map((s) => s.state.gScore?.[s.state.currentNode!])
    for (let i = 1; i < gValues.length; i++) {
      expect(gValues[i]!).toBeGreaterThanOrEqual(gValues[i - 1]!)
    }
  })

  it('relaxes D to a cheaper cost via B before expanding it', () => {
    const relax = steps.find((s) => s.traceEntry?.includes('Update D'))
    expect(relax).toBeDefined()
  })
})

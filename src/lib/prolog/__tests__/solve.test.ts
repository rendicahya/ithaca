import { describe, expect, it } from 'vitest'

import { defaultDatabase, defaultQuery } from '../database'
import { solveProlog } from '../solve'
import { atom, compound, termToString, v } from '../terms'

describe('solveProlog — grandparent(tom, X)', () => {
  const steps = solveProlog(defaultDatabase, defaultQuery)
  const last = steps[steps.length - 1]

  it('terminates', () => {
    expect(last.state.done).toBe(true)
  })

  it('finds exactly the two correct solutions, in order, via backtracking', () => {
    expect(last.state.solutions.map((s) => termToString(s.X))).toEqual(['ann', 'pat'])
  })

  it('records a solutionFound step for each solution', () => {
    const found = steps.filter((s) => s.traceEntry?.key === 'prolog.solutionFound.trace')
    expect(found).toHaveLength(2)
  })

  it('actually backtracks (does not simply enumerate without retrying)', () => {
    const backtracks = steps.filter((s) => s.traceEntry?.key === 'prolog.backtrack.trace')
    expect(backtracks.length).toBeGreaterThan(0)
  })

  it('tries a clause that ultimately fails (the liz branch has no children)', () => {
    const deadEnds = steps.filter((s) => s.traceEntry?.key === 'prolog.noMoreClauses.trace')
    expect(deadEnds.length).toBeGreaterThan(0)
  })

  it('reports the final exhausted-with-solutions message', () => {
    expect(last.traceEntry?.key).toBe('prolog.exhaustedWithSolutions.trace')
    expect(last.traceEntry?.params?.count).toBe(2)
  })
})

describe('solveProlog — a query with no solutions', () => {
  const steps = solveProlog(defaultDatabase, compound('grandparent', [atom('liz'), v('X')]))
  const last = steps[steps.length - 1]

  it('exhausts with zero solutions', () => {
    expect(last.state.done).toBe(true)
    expect(last.state.solutions).toHaveLength(0)
    expect(last.traceEntry?.key).toBe('prolog.exhaustedNoSolutions.trace')
  })
})

describe('solveProlog — a fact query with no variables', () => {
  it('succeeds immediately with one trivial solution', () => {
    const steps = solveProlog(defaultDatabase, compound('parent', [atom('tom'), atom('bob')]))
    const last = steps[steps.length - 1]
    expect(last.state.solutions).toHaveLength(1)
  })

  it('fails when the fact does not hold', () => {
    const steps = solveProlog(defaultDatabase, compound('parent', [atom('bob'), atom('tom')]))
    const last = steps[steps.length - 1]
    expect(last.state.solutions).toHaveLength(0)
  })
})

describe('solveProlog — proof tree', () => {
  it('marks a matched goal as success at the moment it is found', () => {
    const steps = solveProlog(defaultDatabase, defaultQuery)
    const firstSolutionIndex = steps.findIndex(
      (s) => s.traceEntry?.key === 'prolog.solutionFound.trace',
    )
    const statuses = steps[firstSolutionIndex].state.treeNodes.map((n) => n.status)
    expect(statuses).toContain('success')
  })

  it('retroactively marks a once-successful branch as backtracked once the whole search exhausts', () => {
    // Exhaustive search backtracks past *every* branch eventually, including
    // the ones that succeeded — there is nothing left un-retried at the end.
    const steps = solveProlog(defaultDatabase, defaultQuery)
    const last = steps[steps.length - 1]
    const statuses = last.state.treeNodes.map((n) => n.status)
    expect(statuses).toContain('backtracked')
    expect(statuses).not.toContain('success')
    expect(statuses).not.toContain('current')
  })

  it('never removes a node once created (the tree only grows)', () => {
    const steps = solveProlog(defaultDatabase, defaultQuery)
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].state.treeNodes.length).toBeGreaterThanOrEqual(
        steps[i - 1].state.treeNodes.length,
      )
    }
  })
})

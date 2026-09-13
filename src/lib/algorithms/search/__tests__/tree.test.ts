import { describe, expect, it } from 'vitest'

import { treeGraph } from '@/lib/graph/treeGraph'

import { runBfs } from '../bfs'
import { runDfs } from '../dfs'

/**
 * The tree graph has a unique path to every node, so BFS and DFS always
 * agree on *which* path is found. What differs dramatically is how many
 * nodes each algorithm has to visit before it gets there — see
 * treeGraph.ts for why.
 */
describe('BFS vs DFS on a tree', () => {
  it('BFS reaches the shallow goal B almost immediately', () => {
    const steps = runBfs(treeGraph)
    const last = steps[steps.length - 1]
    expect(last.state.found).toBe(true)
    expect(last.state.path).toEqual(['S', 'B'])

    const dequeueOrder = steps
      .filter((s) => s.traceEntry?.key === 'bfs.select.trace')
      .map((s) => s.state.currentNode)
    expect(dequeueOrder).toEqual(['S', 'A', 'B'])
  })

  it('DFS wastes an entire irrelevant subtree before finding the same goal', () => {
    const steps = runDfs(treeGraph)
    const last = steps[steps.length - 1]
    expect(last.state.found).toBe(true)
    expect(last.state.path).toEqual(['S', 'B'])

    const popOrder = steps
      .filter((s) => s.traceEntry?.key === 'dfs.select.trace')
      .map((s) => s.state.currentNode)
    expect(popOrder).toEqual(['S', 'A', 'C', 'G', 'H', 'D', 'I', 'J', 'B'])
  })

  it('DFS visits far more nodes than BFS to reach the same shallow goal', () => {
    const bfsPops = runBfs(treeGraph).filter((s) => s.traceEntry?.key === 'bfs.select.trace').length
    const dfsPops = runDfs(treeGraph).filter((s) => s.traceEntry?.key === 'dfs.select.trace').length
    expect(bfsPops).toBe(3)
    expect(dfsPops).toBe(9)
    expect(dfsPops).toBeGreaterThan(bfsPops)
  })
})

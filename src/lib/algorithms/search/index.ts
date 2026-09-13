import { astarPseudocode, runAstar } from './astar'
import { bfsPseudocode, runBfs } from './bfs'
import { dfsPseudocode, runDfs } from './dfs'
import { greedyPseudocode, runGreedy } from './greedy'
import type { SearchAlgorithm } from './types'
import { ucsPseudocode, runUcs } from './ucs'

export const searchAlgorithms: SearchAlgorithm[] = [
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    shortDescription: 'Explores level by level using a FIFO queue. Not cost-sensitive.',
    frontierKind: 'queue',
    frontierLabel: 'Queue',
    pseudocode: bfsPseudocode,
    run: runBfs,
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    shortDescription: 'Explores as deep as possible using a LIFO stack. Not generally optimal.',
    frontierKind: 'stack',
    frontierLabel: 'Stack',
    pseudocode: dfsPseudocode,
    run: runDfs,
  },
  {
    id: 'ucs',
    name: 'Uniform-Cost Search',
    shortDescription: 'Always expands the node with the smallest path cost g(n).',
    frontierKind: 'priority-g',
    frontierLabel: 'Priority Queue (g)',
    pseudocode: ucsPseudocode,
    run: runUcs,
  },
  {
    id: 'greedy',
    name: 'Greedy Best-First Search',
    shortDescription: 'Always expands the node with the smallest heuristic h(n).',
    frontierKind: 'priority-h',
    frontierLabel: 'Priority Queue (h)',
    pseudocode: greedyPseudocode,
    run: runGreedy,
  },
  {
    id: 'astar',
    name: 'A* Search',
    shortDescription: 'Balances path cost and heuristic estimate: f(n) = g(n) + h(n).',
    frontierKind: 'priority-f',
    frontierLabel: 'Priority Queue (f)',
    pseudocode: astarPseudocode,
    run: runAstar,
  },
]

export function getAlgorithm(id: SearchAlgorithm['id']): SearchAlgorithm {
  const algorithm = searchAlgorithms.find((a) => a.id === id)
  if (!algorithm) throw new Error(`Unknown algorithm: ${id}`)
  return algorithm
}

export type { SearchAlgorithm, SearchState, SearchStep } from './types'

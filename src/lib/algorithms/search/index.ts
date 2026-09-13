import { astarPseudocode, runAstar } from './astar'
import { bfsPseudocode, runBfs } from './bfs'
import { dfsPseudocode, runDfs } from './dfs'
import { greedyPseudocode, runGreedy } from './greedy'
import type { SearchAlgorithm } from './types'
import { ucsPseudocode, runUcs } from './ucs'

export const searchAlgorithms: SearchAlgorithm[] = [
  { id: 'bfs', frontierKind: 'queue', pseudocode: bfsPseudocode, run: runBfs },
  { id: 'dfs', frontierKind: 'stack', pseudocode: dfsPseudocode, run: runDfs },
  { id: 'ucs', frontierKind: 'priority-g', pseudocode: ucsPseudocode, run: runUcs },
  { id: 'greedy', frontierKind: 'priority-h', pseudocode: greedyPseudocode, run: runGreedy },
  { id: 'astar', frontierKind: 'priority-f', pseudocode: astarPseudocode, run: runAstar },
]

export function getAlgorithm(id: SearchAlgorithm['id']): SearchAlgorithm {
  const algorithm = searchAlgorithms.find((a) => a.id === id)
  if (!algorithm) throw new Error(`Unknown algorithm: ${id}`)
  return algorithm
}

export type { SearchAlgorithm, SearchState, SearchStep } from './types'

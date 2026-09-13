import type { NodeId } from '@/lib/graph/types'

export type NodeStatus = 'unvisited' | 'frontier' | 'current' | 'visited' | 'path'

/** Ordering strategy used by the frontier — determines how the frontier is displayed. */
export type FrontierKind = 'queue' | 'stack' | 'priority-g' | 'priority-h' | 'priority-f'

export interface SearchState {
  currentNode: NodeId | null
  /** Frontier contents in the exact order the algorithm will consider them. */
  frontier: NodeId[]
  visited: NodeId[]
  parents: Record<NodeId, NodeId | null>
  /** Final path from start to goal, populated once the goal is found. */
  path: NodeId[]
  pathCost: number
  done: boolean
  found: boolean
  gScore?: Partial<Record<NodeId, number>>
  hScore?: Partial<Record<NodeId, number>>
  fScore?: Partial<Record<NodeId, number>>
  /**
   * Edge ids leading to children just produced by the current expansion —
   * rendered as a dashed line to mark "the result of this expansion",
   * before those children are committed to the frontier.
   */
  expandingEdgeIds: string[]
}

export interface SearchStep {
  state: SearchState
  activePseudocodeLine: number
  explanation: string
  traceEntry?: string
}

export interface SearchAlgorithm {
  id: 'bfs' | 'dfs' | 'ucs' | 'greedy' | 'astar'
  name: string
  shortDescription: string
  frontierKind: FrontierKind
  frontierLabel: string
  pseudocode: string[]
  run: (graph: import('@/lib/graph/types').Graph) => SearchStep[]
}

export function cloneState(state: SearchState): SearchState {
  return {
    currentNode: state.currentNode,
    frontier: [...state.frontier],
    visited: [...state.visited],
    parents: { ...state.parents },
    path: [...state.path],
    pathCost: state.pathCost,
    done: state.done,
    found: state.found,
    gScore: state.gScore ? { ...state.gScore } : undefined,
    hScore: state.hScore ? { ...state.hScore } : undefined,
    fScore: state.fScore ? { ...state.fScore } : undefined,
    expandingEdgeIds: [...state.expandingEdgeIds],
  }
}

export function reconstructPath(
  parents: Record<NodeId, NodeId | null>,
  goal: NodeId,
): NodeId[] {
  const path: NodeId[] = []
  let current: NodeId | null = goal
  while (current !== null) {
    path.unshift(current)
    current = parents[current] ?? null
  }
  return path
}

export function pathCost(graph: import('@/lib/graph/types').Graph, path: NodeId[]): number {
  let total = 0
  for (let i = 0; i < path.length - 1; i++) {
    const edge = graph.edges.find(
      (e) =>
        (e.source === path[i] && e.target === path[i + 1]) ||
        (e.target === path[i] && e.source === path[i + 1]),
    )
    if (edge) total += edge.cost
  }
  return total
}

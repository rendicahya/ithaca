import { msg } from '@/lib/i18n/translate'
import type { Graph, NodeId } from '@/lib/graph/types'
import { neighborsOf } from '@/lib/graph/types'

import { cloneState, pathCost, reconstructPath } from './types'
import type { SearchState, SearchStep } from './types'

export const bfsPseudocode = [
  'frontier ← queue containing start',
  'mark start as discovered',
  'while frontier is not empty',
  '    node ← dequeue(frontier)',
  '    if node is goal',
  '        return reconstruct(path)',
  '    for each neighbor of node',
  '        if neighbor not discovered',
  '            mark neighbor as discovered',
  '            parent(neighbor) ← node',
  '            enqueue(frontier, neighbor)',
  'return failure',
]

export function runBfs(graph: Graph): SearchStep[] {
  const steps: SearchStep[] = []
  const discovered = new Set<NodeId>([graph.start])
  const parents: Record<NodeId, NodeId | null> = { [graph.start]: null }

  let state: SearchState = {
    currentNode: null,
    frontier: [graph.start],
    visited: [],
    parents,
    path: [],
    pathCost: 0,
    done: false,
    found: false,
    expandingEdgeIds: [],
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 1,
    explanation: msg('bfs.init', { start: graph.start }),
    traceEntry: msg('bfs.init.trace', { start: graph.start }),
  })

  while (state.frontier.length > 0) {
    const node = state.frontier[0]
    state = { ...cloneState(state), frontier: state.frontier.slice(1), expandingEdgeIds: [] }
    state.currentNode = node
    state.visited = [...state.visited, node]

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 4,
      explanation: msg('bfs.select', { node }),
      traceEntry: msg('bfs.select.trace', { node }),
    })

    if (node === graph.goal) {
      const path = reconstructPath(state.parents, graph.goal)
      state = { ...cloneState(state), done: true, found: true, path, pathCost: pathCost(graph, path) }
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 6,
        explanation: msg('bfs.goalFound', { node, path: path.join(' → '), cost: state.pathCost }),
        traceEntry: msg('bfs.goalFound.trace', { node }),
      })
      return steps
    }

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 5,
      explanation: msg('bfs.checkNotGoal', { node, goal: graph.goal }),
      traceEntry: msg('bfs.checkNotGoal.trace', { node }),
    })

    const neighbors = neighborsOf(graph, node)
    const newlyDiscovered: NodeId[] = []
    const expandingEdgeIds: string[] = []
    for (const { id: neighbor, edgeId } of neighbors) {
      if (!discovered.has(neighbor)) {
        newlyDiscovered.push(neighbor)
        expandingEdgeIds.push(edgeId)
      }
    }

    state.expandingEdgeIds = expandingEdgeIds
    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 7,
      explanation:
        newlyDiscovered.length > 0
          ? msg('bfs.expand.some', { node, list: newlyDiscovered.join(', ') })
          : msg('bfs.expand.none', { node }),
      traceEntry: msg('bfs.expand.trace', { node }),
    })

    for (const neighbor of newlyDiscovered) {
      discovered.add(neighbor)
      state.parents[neighbor] = node
    }
    state.frontier = [...state.frontier, ...newlyDiscovered]
    state.expandingEdgeIds = []

    if (newlyDiscovered.length > 0) {
      const list = newlyDiscovered.join(', ')
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 11,
        explanation: msg('bfs.commit', { list }),
        traceEntry: msg('bfs.commit.trace', { list }),
      })
    }
  }

  steps.push({
    state: cloneState({ ...state, done: true, found: false }),
    activePseudocodeLine: 12,
    explanation: msg('bfs.noSolution', { goal: graph.goal, start: graph.start }),
    traceEntry: msg('bfs.noSolution.trace'),
  })
  return steps
}

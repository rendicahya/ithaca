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
    explanation: `Start at ${graph.start}. It is placed in the frontier queue.`,
    traceEntry: `Initialize frontier with ${graph.start}`,
  })

  while (state.frontier.length > 0) {
    const node = state.frontier[0]
    state = { ...cloneState(state), frontier: state.frontier.slice(1), expandingEdgeIds: [] }
    state.currentNode = node
    state.visited = [...state.visited, node]

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 4,
      explanation: `BFS removes ${node} from the front of the queue.`,
      traceEntry: `Dequeue ${node}`,
    })

    if (node === graph.goal) {
      const path = reconstructPath(state.parents, graph.goal)
      state = { ...cloneState(state), done: true, found: true, path, pathCost: pathCost(graph, path) }
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 6,
        explanation: `${node} is the goal. BFS returns the path ${path.join(' → ')} with cost ${state.pathCost}.`,
        traceEntry: `Goal reached: ${node}`,
      })
      return steps
    }

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 5,
      explanation: `Checking whether ${node} is the goal (${graph.goal}) — it is not, so BFS continues.`,
      traceEntry: `Check ${node}: not the goal`,
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
          ? `BFS expands ${node}, examining its neighbors. ${newlyDiscovered.join(', ')} are newly discovered (dashed).`
          : `BFS expands ${node}, examining its neighbors. All neighbors are already discovered.`,
      traceEntry: `Expand ${node}`,
    })

    for (const neighbor of newlyDiscovered) {
      discovered.add(neighbor)
      state.parents[neighbor] = node
    }
    state.frontier = [...state.frontier, ...newlyDiscovered]
    state.expandingEdgeIds = []

    if (newlyDiscovered.length > 0) {
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 11,
        explanation: `BFS enqueues ${newlyDiscovered.join(', ')} at the back of the queue.`,
        traceEntry: `Enqueue ${newlyDiscovered.join(', ')}`,
      })
    }
  }

  steps.push({
    state: cloneState({ ...state, done: true, found: false }),
    activePseudocodeLine: 12,
    explanation: `The frontier is empty. ${graph.goal} is unreachable from ${graph.start}.`,
    traceEntry: 'Frontier empty — no solution',
  })
  return steps
}

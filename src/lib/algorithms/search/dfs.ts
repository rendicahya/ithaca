import type { Graph, NodeId } from '@/lib/graph/types'
import { neighborsOf } from '@/lib/graph/types'

import { cloneState, pathCost, reconstructPath } from './types'
import type { SearchState, SearchStep } from './types'

export const dfsPseudocode = [
  'frontier ← stack containing start',
  'mark start as discovered',
  'while frontier is not empty',
  '    node ← pop(frontier)',
  '    if node is goal',
  '        return reconstruct(path)',
  '    for each neighbor of node, in reverse order',
  '        if neighbor not discovered',
  '            mark neighbor as discovered',
  '            parent(neighbor) ← node',
  '            push(frontier, neighbor)',
  'return failure',
]

export function runDfs(graph: Graph): SearchStep[] {
  const steps: SearchStep[] = []
  const discovered = new Set<NodeId>([graph.start])
  const parents: Record<NodeId, NodeId | null> = { [graph.start]: null }

  // Frontier is a stack; the LAST element is the top.
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
    explanation: `Start at ${graph.start}. It is placed on top of the stack.`,
    traceEntry: `Initialize stack with ${graph.start}`,
  })

  while (state.frontier.length > 0) {
    const node = state.frontier[state.frontier.length - 1]
    state = {
      ...cloneState(state),
      frontier: state.frontier.slice(0, -1),
      expandingEdgeIds: [],
    }
    state.currentNode = node
    state.visited = [...state.visited, node]

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 4,
      explanation: `DFS pops ${node} from the top of the stack.`,
      traceEntry: `Pop ${node}`,
    })

    if (node === graph.goal) {
      const path = reconstructPath(state.parents, graph.goal)
      state = { ...cloneState(state), done: true, found: true, path, pathCost: pathCost(graph, path) }
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 6,
        explanation: `${node} is the goal. DFS returns the path ${path.join(' → ')} with cost ${state.pathCost}.`,
        traceEntry: `Goal reached: ${node}`,
      })
      return steps
    }

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 5,
      explanation: `Checking whether ${node} is the goal (${graph.goal}) — it is not, so DFS continues.`,
      traceEntry: `Check ${node}: not the goal`,
    })

    const neighbors = neighborsOf(graph, node)
    const newlyDiscovered: NodeId[] = []
    const expandingEdgeIds: string[] = []
    // Pushed onto the stack in reverse order, so the FIRST listed neighbor
    // ends up on top and is popped next — this is the order that matters
    // for traversal, distinct from newlyDiscovered's left-to-right display order.
    const pushOrder: NodeId[] = []
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const { id: neighbor, edgeId } = neighbors[i]
      if (!discovered.has(neighbor)) {
        newlyDiscovered.unshift(neighbor)
        expandingEdgeIds.unshift(edgeId)
        pushOrder.push(neighbor)
      }
    }

    state.expandingEdgeIds = expandingEdgeIds
    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 7,
      explanation:
        newlyDiscovered.length > 0
          ? `DFS expands ${node}, examining its neighbors. ${newlyDiscovered.join(', ')} are newly discovered (dashed).`
          : `DFS expands ${node}, examining its neighbors. All neighbors are already discovered.`,
      traceEntry: `Expand ${node}`,
    })

    for (const neighbor of newlyDiscovered) {
      discovered.add(neighbor)
      state.parents[neighbor] = node
    }
    state.frontier = [...state.frontier, ...pushOrder]
    state.expandingEdgeIds = []

    if (newlyDiscovered.length > 0) {
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 11,
        explanation: `DFS pushes ${newlyDiscovered.join(', ')} onto the stack.`,
        traceEntry: `Push ${newlyDiscovered.join(', ')}`,
      })
    }
  }

  steps.push({
    state: cloneState({ ...state, done: true, found: false }),
    activePseudocodeLine: 12,
    explanation: `The stack is empty. ${graph.goal} is unreachable from ${graph.start}.`,
    traceEntry: 'Stack empty — no solution',
  })
  return steps
}

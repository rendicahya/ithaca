import { msg } from '@/lib/i18n/translate'
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
    explanation: msg('dfs.init', { start: graph.start }),
    traceEntry: msg('dfs.init.trace', { start: graph.start }),
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
      explanation: msg('dfs.select', { node }),
      traceEntry: msg('dfs.select.trace', { node }),
    })

    if (node === graph.goal) {
      const path = reconstructPath(state.parents, graph.goal)
      state = { ...cloneState(state), done: true, found: true, path, pathCost: pathCost(graph, path) }
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 6,
        explanation: msg('dfs.goalFound', { node, path: path.join(' → '), cost: state.pathCost }),
        traceEntry: msg('dfs.goalFound.trace', { node }),
      })
      return steps
    }

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 5,
      explanation: msg('dfs.checkNotGoal', { node, goal: graph.goal }),
      traceEntry: msg('dfs.checkNotGoal.trace', { node }),
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
          ? msg('dfs.expand.some', { node, list: newlyDiscovered.join(', ') })
          : msg('dfs.expand.none', { node }),
      traceEntry: msg('dfs.expand.trace', { node }),
    })

    for (const neighbor of newlyDiscovered) {
      discovered.add(neighbor)
      state.parents[neighbor] = node
    }
    state.frontier = [...state.frontier, ...pushOrder]
    state.expandingEdgeIds = []

    if (newlyDiscovered.length > 0) {
      const list = newlyDiscovered.join(', ')
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 11,
        explanation: msg('dfs.commit', { list }),
        traceEntry: msg('dfs.commit.trace', { list }),
      })
    }
  }

  steps.push({
    state: cloneState({ ...state, done: true, found: false }),
    activePseudocodeLine: 12,
    explanation: msg('dfs.noSolution', { goal: graph.goal, start: graph.start }),
    traceEntry: msg('dfs.noSolution.trace'),
  })
  return steps
}

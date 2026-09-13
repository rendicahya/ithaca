import { getNode, neighborsOf } from '@/lib/graph/types'
import type { Graph, NodeId } from '@/lib/graph/types'
import { msg } from '@/lib/i18n/translate'

import { cloneState, pathCost, reconstructPath } from './types'
import type { SearchState, SearchStep } from './types'

export const greedyPseudocode = [
  'frontier ← priority queue ordered by h(n)',
  'insert start',
  'while frontier is not empty',
  '    node ← extract node with smallest h(n)',
  '    if node is goal',
  '        return reconstruct(path)',
  '    for each neighbor of node',
  '        if neighbor undiscovered',
  '            parent(neighbor) ← node',
  '            insert neighbor into frontier, ordered by h(neighbor)',
  'return failure',
]

function sortByH(frontier: NodeId[], hScore: Partial<Record<NodeId, number>>): NodeId[] {
  return [...frontier].sort((a, b) => {
    const diff = (hScore[a] ?? Infinity) - (hScore[b] ?? Infinity)
    return diff !== 0 ? diff : a.localeCompare(b)
  })
}

export function runGreedy(graph: Graph): SearchStep[] {
  const steps: SearchStep[] = []
  const hScore: Partial<Record<NodeId, number>> = {}
  for (const n of graph.nodes) hScore[n.id] = n.heuristic
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
    hScore: { ...hScore },
    expandingEdgeIds: [],
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 2,
    explanation: msg('greedy.init', { start: graph.start, h: hScore[graph.start]! }),
    traceEntry: msg('greedy.init.trace', { start: graph.start }),
  })

  while (state.frontier.length > 0) {
    const ordered = sortByH(state.frontier, hScore)
    const node = ordered[0]
    state = {
      ...cloneState(state),
      frontier: state.frontier.filter((n) => n !== node),
      expandingEdgeIds: [],
    }
    state.currentNode = node
    state.visited = [...state.visited, node]

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 4,
      explanation: msg('greedy.select', { node, h: hScore[node]! }),
      traceEntry: msg('greedy.select.trace', { node, h: hScore[node]! }),
    })

    if (node === graph.goal) {
      const path = reconstructPath(state.parents, graph.goal)
      state = { ...cloneState(state), done: true, found: true, path, pathCost: pathCost(graph, path) }
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 6,
        explanation: msg('greedy.goalFound', { node, path: path.join(' → '), cost: state.pathCost }),
        traceEntry: msg('greedy.goalFound.trace', { node }),
      })
      return steps
    }

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 5,
      explanation: msg('greedy.checkNotGoal', { node, goal: graph.goal }),
      traceEntry: msg('greedy.checkNotGoal.trace', { node }),
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
          ? msg('greedy.expand.some', { node, list: newlyDiscovered.join(', ') })
          : msg('greedy.expand.none', { node }),
      traceEntry: msg('greedy.expand.trace', { node }),
    })

    const insertedIds: string[] = []
    for (const neighbor of newlyDiscovered) {
      discovered.add(neighbor)
      state.parents[neighbor] = node
      state.frontier = [...state.frontier, neighbor]
      insertedIds.push(`${neighbor} (h=${getNode(graph, neighbor).heuristic})`)
    }
    state.expandingEdgeIds = []

    if (insertedIds.length > 0) {
      const list = insertedIds.join(', ')
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 10,
        explanation: msg('greedy.commit', { list }),
        traceEntry: msg('greedy.commit.trace', { list }),
      })
    }
  }

  steps.push({
    state: cloneState({ ...state, done: true, found: false }),
    activePseudocodeLine: 11,
    explanation: msg('greedy.noSolution', { goal: graph.goal, start: graph.start }),
    traceEntry: msg('greedy.noSolution.trace'),
  })
  return steps
}

import { getNode, neighborsOf } from '@/lib/graph/types'
import type { Graph, NodeId } from '@/lib/graph/types'

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
    explanation: `Start at ${graph.start}. h(${graph.start}) = ${hScore[graph.start]}.`,
    traceEntry: `Initialize frontier with ${graph.start}`,
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
      explanation: `Greedy selects ${node} because h(${node}) = ${hScore[node]} is the smallest heuristic value in the frontier.`,
      traceEntry: `Select ${node} (h=${hScore[node]})`,
    })

    if (node === graph.goal) {
      const path = reconstructPath(state.parents, graph.goal)
      state = { ...cloneState(state), done: true, found: true, path, pathCost: pathCost(graph, path) }
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 6,
        explanation: `${node} is the goal. Greedy returns the path ${path.join(' → ')} with cost ${state.pathCost}.`,
        traceEntry: `Goal reached: ${node}`,
      })
      return steps
    }

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 5,
      explanation: `Checking whether ${node} is the goal (${graph.goal}) — it is not, so Greedy continues.`,
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
          ? `Greedy expands ${node}, examining its neighbors. ${newlyDiscovered.join(', ')} are newly discovered (dashed).`
          : `Greedy expands ${node}, examining its neighbors. All neighbors are already discovered.`,
      traceEntry: `Expand ${node}`,
    })

    const inserted: string[] = []
    for (const neighbor of newlyDiscovered) {
      discovered.add(neighbor)
      state.parents[neighbor] = node
      state.frontier = [...state.frontier, neighbor]
      inserted.push(`${neighbor} (h=${getNode(graph, neighbor).heuristic})`)
    }
    state.expandingEdgeIds = []

    if (inserted.length > 0) {
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 10,
        explanation: `Greedy inserts ${inserted.join(', ')} into the priority queue. Note that path cost so far is not considered.`,
        traceEntry: `Insert ${inserted.join(', ')}`,
      })
    }
  }

  steps.push({
    state: cloneState({ ...state, done: true, found: false }),
    activePseudocodeLine: 11,
    explanation: `The frontier is empty. ${graph.goal} is unreachable from ${graph.start}.`,
    traceEntry: 'Frontier empty — no solution',
  })
  return steps
}

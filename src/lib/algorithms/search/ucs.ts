import type { Graph, NodeId } from '@/lib/graph/types'
import { neighborsOf } from '@/lib/graph/types'

import { cloneState, pathCost, reconstructPath } from './types'
import type { SearchState, SearchStep } from './types'

export const ucsPseudocode = [
  'frontier ← priority queue ordered by g(n)',
  'g(start) ← 0, parent(start) ← null, insert start',
  'while frontier is not empty',
  '    node ← extract node with smallest g(n)',
  '    if node is goal',
  '        return reconstruct(path)',
  '    for each neighbor of node with edge cost c',
  '        newG ← g(node) + c',
  '        if neighbor undiscovered or newG < g(neighbor)',
  '            g(neighbor) ← newG',
  '            parent(neighbor) ← node',
  '            insert/update neighbor in frontier',
  'return failure',
]

function sortByG(frontier: NodeId[], gScore: Partial<Record<NodeId, number>>): NodeId[] {
  return [...frontier].sort((a, b) => {
    const diff = (gScore[a] ?? Infinity) - (gScore[b] ?? Infinity)
    return diff !== 0 ? diff : a.localeCompare(b)
  })
}

export function runUcs(graph: Graph): SearchStep[] {
  const steps: SearchStep[] = []
  const gScore: Partial<Record<NodeId, number>> = { [graph.start]: 0 }
  const parents: Record<NodeId, NodeId | null> = { [graph.start]: null }
  const expanded = new Set<NodeId>()

  let state: SearchState = {
    currentNode: null,
    frontier: [graph.start],
    visited: [],
    parents,
    path: [],
    pathCost: 0,
    done: false,
    found: false,
    gScore: { ...gScore },
    expandingEdgeIds: [],
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 2,
    explanation: `Start at ${graph.start} with g(${graph.start}) = 0.`,
    traceEntry: `Initialize frontier with ${graph.start} (g=0)`,
  })

  while (state.frontier.length > 0) {
    const ordered = sortByG(state.frontier, gScore)
    const node = ordered[0]
    state = {
      ...cloneState(state),
      frontier: state.frontier.filter((n) => n !== node),
      expandingEdgeIds: [],
    }
    state.currentNode = node
    state.visited = [...state.visited, node]
    expanded.add(node)

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 4,
      explanation: `UCS selects ${node} because g(${node}) = ${gScore[node]} is the smallest path cost in the frontier.`,
      traceEntry: `Select ${node} (g=${gScore[node]})`,
    })

    if (node === graph.goal) {
      const path = reconstructPath(state.parents, graph.goal)
      state = { ...cloneState(state), done: true, found: true, path, pathCost: pathCost(graph, path) }
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 6,
        explanation: `${node} is the goal. UCS returns the path ${path.join(' → ')} with cost ${state.pathCost}.`,
        traceEntry: `Goal reached: ${node}`,
      })
      return steps
    }

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 5,
      explanation: `Checking whether ${node} is the goal (${graph.goal}) — it is not, so UCS continues.`,
      traceEntry: `Check ${node}: not the goal`,
    })

    // Preview which neighbors this expansion will insert or improve, without
    // mutating scores yet, so the expand step can highlight the result.
    const inserted: { id: NodeId; edgeId: string; newG: number }[] = []
    const updated: { id: NodeId; edgeId: string; oldG: number; newG: number }[] = []
    for (const { id: neighbor, edgeId, cost } of neighborsOf(graph, node)) {
      if (expanded.has(neighbor)) continue
      const newG = (gScore[node] ?? 0) + cost
      const currentG = gScore[neighbor]
      if (currentG === undefined) {
        inserted.push({ id: neighbor, edgeId, newG })
      } else if (newG < currentG) {
        updated.push({ id: neighbor, edgeId, oldG: currentG, newG })
      }
    }

    state.expandingEdgeIds = [...inserted, ...updated].map((e) => e.edgeId)
    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 7,
      explanation: `UCS expands ${node}, examining its neighbors.`,
      traceEntry: `Expand ${node}`,
    })

    for (const { id: neighbor, newG } of inserted) {
      gScore[neighbor] = newG
      state.parents[neighbor] = node
      state.frontier = [...state.frontier, neighbor]
    }
    for (const { id: neighbor, newG } of updated) {
      gScore[neighbor] = newG
      state.parents[neighbor] = node
    }
    state.gScore = { ...gScore }
    state.expandingEdgeIds = []

    if (inserted.length > 0 || updated.length > 0) {
      const parts: string[] = []
      if (inserted.length > 0) {
        parts.push(`inserts ${inserted.map((e) => `${e.id} (g=${e.newG})`).join(', ')}`)
      }
      if (updated.length > 0) {
        parts.push(`updates ${updated.map((e) => `${e.id} (g=${e.oldG}→${e.newG})`).join(', ')}`)
      }
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 12,
        explanation: `UCS ${parts.join(' and ')} into the priority queue.`,
        traceEntry: [
          inserted.length > 0 ? `Insert ${inserted.map((e) => `${e.id} (g=${e.newG})`).join(', ')}` : '',
          updated.length > 0
            ? `Update ${updated.map((e) => `${e.id} (g=${e.oldG}→${e.newG})`).join(', ')}`
            : '',
        ]
          .filter(Boolean)
          .join('; '),
      })
    }
  }

  steps.push({
    state: cloneState({ ...state, done: true, found: false }),
    activePseudocodeLine: 13,
    explanation: `The frontier is empty. ${graph.goal} is unreachable from ${graph.start}.`,
    traceEntry: 'Frontier empty — no solution',
  })
  return steps
}

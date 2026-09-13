import { neighborsOf } from '@/lib/graph/types'
import type { Graph, NodeId } from '@/lib/graph/types'

import { cloneState, pathCost, reconstructPath } from './types'
import type { SearchState, SearchStep } from './types'

export const astarPseudocode = [
  'frontier ← priority queue ordered by f(n) = g(n) + h(n)',
  'g(start) ← 0, f(start) ← h(start), parent(start) ← null, insert start',
  'while frontier is not empty',
  '    node ← extract node with smallest f(n)',
  '    if node is goal',
  '        return reconstruct(path)',
  '    for each neighbor of node with edge cost c',
  '        newG ← g(node) + c',
  '        if neighbor undiscovered or newG < g(neighbor)',
  '            g(neighbor) ← newG, f(neighbor) ← g(neighbor) + h(neighbor)',
  '            parent(neighbor) ← node',
  '            insert/update neighbor in frontier',
  'return failure',
]

function sortByF(
  frontier: NodeId[],
  fScore: Partial<Record<NodeId, number>>,
  hScore: Partial<Record<NodeId, number>>,
): NodeId[] {
  return [...frontier].sort((a, b) => {
    const fDiff = (fScore[a] ?? Infinity) - (fScore[b] ?? Infinity)
    if (fDiff !== 0) return fDiff
    const hDiff = (hScore[a] ?? Infinity) - (hScore[b] ?? Infinity)
    if (hDiff !== 0) return hDiff
    return a.localeCompare(b)
  })
}

export function runAstar(graph: Graph): SearchStep[] {
  const steps: SearchStep[] = []
  const hScore: Partial<Record<NodeId, number>> = {}
  for (const n of graph.nodes) hScore[n.id] = n.heuristic

  const gScore: Partial<Record<NodeId, number>> = { [graph.start]: 0 }
  const fScore: Partial<Record<NodeId, number>> = { [graph.start]: hScore[graph.start] }
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
    hScore: { ...hScore },
    fScore: { ...fScore },
    expandingEdgeIds: [],
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 2,
    explanation: `Start at ${graph.start}. g(${graph.start}) = 0, h(${graph.start}) = ${hScore[graph.start]}, f(${graph.start}) = ${fScore[graph.start]}.`,
    traceEntry: `Initialize frontier with ${graph.start} (f=${fScore[graph.start]})`,
  })

  while (state.frontier.length > 0) {
    const ordered = sortByF(state.frontier, fScore, hScore)
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
      explanation: `A* selects ${node} because f(${node}) = g(${node}) + h(${node}) = ${gScore[node]} + ${hScore[node]} = ${fScore[node]} is minimal.`,
      traceEntry: `Select ${node} (f=${fScore[node]})`,
    })

    if (node === graph.goal) {
      const path = reconstructPath(state.parents, graph.goal)
      state = { ...cloneState(state), done: true, found: true, path, pathCost: pathCost(graph, path) }
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 6,
        explanation: `${node} is the goal. A* returns the path ${path.join(' → ')} with cost ${state.pathCost}.`,
        traceEntry: `Goal reached: ${node}`,
      })
      return steps
    }

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 5,
      explanation: `Checking whether ${node} is the goal (${graph.goal}) — it is not, so A* continues.`,
      traceEntry: `Check ${node}: not the goal`,
    })

    const inserted: { id: NodeId; edgeId: string; newG: number; newF: number }[] = []
    const updated: { id: NodeId; edgeId: string; oldF: number; newG: number; newF: number }[] = []
    for (const { id: neighbor, edgeId, cost } of neighborsOf(graph, node)) {
      if (expanded.has(neighbor)) continue
      const newG = (gScore[node] ?? 0) + cost
      const newF = newG + (hScore[neighbor] ?? 0)
      const currentG = gScore[neighbor]
      if (currentG === undefined) {
        inserted.push({ id: neighbor, edgeId, newG, newF })
      } else if (newG < currentG) {
        updated.push({ id: neighbor, edgeId, oldF: fScore[neighbor]!, newG, newF })
      }
    }

    state.expandingEdgeIds = [...inserted, ...updated].map((e) => e.edgeId)
    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 7,
      explanation: `A* expands ${node}, examining its neighbors.`,
      traceEntry: `Expand ${node}`,
    })

    for (const { id: neighbor, newG, newF } of inserted) {
      gScore[neighbor] = newG
      fScore[neighbor] = newF
      state.parents[neighbor] = node
      state.frontier = [...state.frontier, neighbor]
    }
    for (const { id: neighbor, newG, newF } of updated) {
      gScore[neighbor] = newG
      fScore[neighbor] = newF
      state.parents[neighbor] = node
    }
    state.gScore = { ...gScore }
    state.fScore = { ...fScore }
    state.expandingEdgeIds = []

    if (inserted.length > 0 || updated.length > 0) {
      const parts: string[] = []
      if (inserted.length > 0) {
        parts.push(`inserts ${inserted.map((e) => `${e.id} (f=${e.newF})`).join(', ')}`)
      }
      if (updated.length > 0) {
        parts.push(`updates ${updated.map((e) => `${e.id} (f=${e.oldF}→${e.newF})`).join(', ')}`)
      }
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 12,
        explanation: `A* ${parts.join(' and ')} into the priority queue.`,
        traceEntry: [
          inserted.length > 0 ? `Insert ${inserted.map((e) => `${e.id} (f=${e.newF})`).join(', ')}` : '',
          updated.length > 0
            ? `Update ${updated.map((e) => `${e.id} (f=${e.oldF}→${e.newF})`).join(', ')}`
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

import { neighborsOf } from '@/lib/graph/types'
import type { Graph, NodeId } from '@/lib/graph/types'
import { msg } from '@/lib/i18n/translate'

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
    explanation: msg('astar.init', {
      start: graph.start,
      g: 0,
      h: hScore[graph.start]!,
      f: fScore[graph.start]!,
    }),
    traceEntry: msg('astar.init.trace', { start: graph.start, f: fScore[graph.start]! }),
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
      explanation: msg('astar.select', {
        node,
        g: gScore[node]!,
        h: hScore[node]!,
        f: fScore[node]!,
      }),
      traceEntry: msg('astar.select.trace', { node, f: fScore[node]! }),
    })

    if (node === graph.goal) {
      const path = reconstructPath(state.parents, graph.goal)
      state = { ...cloneState(state), done: true, found: true, path, pathCost: pathCost(graph, path) }
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 6,
        explanation: msg('astar.goalFound', { node, path: path.join(' → '), cost: state.pathCost }),
        traceEntry: msg('astar.goalFound.trace', { node }),
      })
      return steps
    }

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 5,
      explanation: msg('astar.checkNotGoal', { node, goal: graph.goal }),
      traceEntry: msg('astar.checkNotGoal.trace', { node }),
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
      explanation: msg('astar.expand', { node }),
      traceEntry: msg('astar.expand.trace', { node }),
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
      const insertedList = inserted.map((e) => `${e.id} (f=${e.newF})`).join(', ')
      const updatedList = updated.map((e) => `${e.id} (f=${e.oldF}→${e.newF})`).join(', ')
      if (inserted.length > 0 && updated.length > 0) {
        steps.push({
          state: cloneState(state),
          activePseudocodeLine: 12,
          explanation: msg('astar.commit.both', { inserted: insertedList, updated: updatedList }),
          traceEntry: msg('astar.commit.trace.both', {
            inserted: insertedList,
            updated: updatedList,
          }),
        })
      } else if (inserted.length > 0) {
        steps.push({
          state: cloneState(state),
          activePseudocodeLine: 12,
          explanation: msg('astar.commit.insertOnly', { list: insertedList }),
          traceEntry: msg('astar.commit.trace.insertOnly', { list: insertedList }),
        })
      } else {
        steps.push({
          state: cloneState(state),
          activePseudocodeLine: 12,
          explanation: msg('astar.commit.updateOnly', { list: updatedList }),
          traceEntry: msg('astar.commit.trace.updateOnly', { list: updatedList }),
        })
      }
    }
  }

  steps.push({
    state: cloneState({ ...state, done: true, found: false }),
    activePseudocodeLine: 13,
    explanation: msg('astar.noSolution', { goal: graph.goal, start: graph.start }),
    traceEntry: msg('astar.noSolution.trace'),
  })
  return steps
}

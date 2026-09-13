import { msg } from '@/lib/i18n/translate'
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
    explanation: msg('ucs.init', { start: graph.start, g: 0 }),
    traceEntry: msg('ucs.init.trace', { start: graph.start, g: 0 }),
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
      explanation: msg('ucs.select', { node, g: gScore[node]! }),
      traceEntry: msg('ucs.select.trace', { node, g: gScore[node]! }),
    })

    if (node === graph.goal) {
      const path = reconstructPath(state.parents, graph.goal)
      state = { ...cloneState(state), done: true, found: true, path, pathCost: pathCost(graph, path) }
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 6,
        explanation: msg('ucs.goalFound', { node, path: path.join(' → '), cost: state.pathCost }),
        traceEntry: msg('ucs.goalFound.trace', { node }),
      })
      return steps
    }

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 5,
      explanation: msg('ucs.checkNotGoal', { node, goal: graph.goal }),
      traceEntry: msg('ucs.checkNotGoal.trace', { node }),
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
      explanation: msg('ucs.expand', { node }),
      traceEntry: msg('ucs.expand.trace', { node }),
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
      const insertedList = inserted.map((e) => `${e.id} (g=${e.newG})`).join(', ')
      const updatedList = updated.map((e) => `${e.id} (g=${e.oldG}→${e.newG})`).join(', ')
      if (inserted.length > 0 && updated.length > 0) {
        steps.push({
          state: cloneState(state),
          activePseudocodeLine: 12,
          explanation: msg('ucs.commit.both', { inserted: insertedList, updated: updatedList }),
          traceEntry: msg('ucs.commit.trace.both', { inserted: insertedList, updated: updatedList }),
        })
      } else if (inserted.length > 0) {
        steps.push({
          state: cloneState(state),
          activePseudocodeLine: 12,
          explanation: msg('ucs.commit.insertOnly', { list: insertedList }),
          traceEntry: msg('ucs.commit.trace.insertOnly', { list: insertedList }),
        })
      } else {
        steps.push({
          state: cloneState(state),
          activePseudocodeLine: 12,
          explanation: msg('ucs.commit.updateOnly', { list: updatedList }),
          traceEntry: msg('ucs.commit.trace.updateOnly', { list: updatedList }),
        })
      }
    }
  }

  steps.push({
    state: cloneState({ ...state, done: true, found: false }),
    activePseudocodeLine: 13,
    explanation: msg('ucs.noSolution', { goal: graph.goal, start: graph.start }),
    traceEntry: msg('ucs.noSolution.trace'),
  })
  return steps
}

import { neighborsOf } from './types'
import type { Graph, NodeId } from './types'

/**
 * Exact shortest-path cost from every node to `goalId`, via Dijkstra over
 * the (undirected) edge costs. The hand-tuned h(n) values on defaultGraph
 * and treeGraph are only valid for their original goal (some are
 * deliberately loose, not tight, to make Greedy's flaw visible) — whenever
 * the user picks a different goal, heuristics must be recomputed or Greedy
 * and A* would silently become incorrect for that goal.
 */
export function computeHeuristics(graph: Graph, goalId: NodeId): Record<NodeId, number> {
  const dist: Record<NodeId, number> = {}
  for (const node of graph.nodes) dist[node.id] = Infinity
  dist[goalId] = 0

  const unvisited = new Set(graph.nodes.map((n) => n.id))
  while (unvisited.size > 0) {
    let current: NodeId | null = null
    for (const id of unvisited) {
      if (current === null || dist[id] < dist[current]) current = id
    }
    if (current === null || dist[current] === Infinity) break
    unvisited.delete(current)

    for (const neighbor of neighborsOf(graph, current)) {
      const candidate = dist[current] + neighbor.cost
      if (candidate < dist[neighbor.id]) dist[neighbor.id] = candidate
    }
  }

  const result: Record<NodeId, number> = {}
  for (const node of graph.nodes) {
    result[node.id] = dist[node.id] === Infinity ? 0 : dist[node.id]
  }
  return result
}

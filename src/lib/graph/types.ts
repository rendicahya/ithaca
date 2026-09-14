export type NodeId = string

export interface GraphNode {
  id: NodeId
  label: string
  /** Fixed classroom layout position — deliberately designed, not auto-laid-out. */
  x: number
  y: number
  /** Heuristic estimate h(n) to the goal, used by Greedy and A*. */
  heuristic: number
}

export interface GraphEdge {
  id: string
  source: NodeId
  target: NodeId
  cost: number
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  start: NodeId
  goal: NodeId
  /**
   * How edges connect to nodes visually: 'horizontal' (left → right, the
   * default roadmap-style layout) or 'vertical' (top → bottom, for
   * tree-shaped examples). Purely a rendering concern — algorithms don't
   * read this field.
   */
  layout?: 'horizontal' | 'vertical'
}

export interface Neighbor {
  id: NodeId
  edgeId: string
  cost: number
}

/**
 * Neighbors in edge-declaration order (both directions), so traversal order
 * is deterministic and matches the algorithm traces documented alongside
 * the default graph.
 */
export function neighborsOf(graph: Graph, nodeId: NodeId): Neighbor[] {
  const result: Neighbor[] = []
  for (const edge of graph.edges) {
    if (edge.source === nodeId) {
      result.push({ id: edge.target, edgeId: edge.id, cost: edge.cost })
    } else if (edge.target === nodeId) {
      result.push({ id: edge.source, edgeId: edge.id, cost: edge.cost })
    }
  }
  return result
}

export function getNode(graph: Graph, id: NodeId): GraphNode {
  const node = graph.nodes.find((n) => n.id === id)
  if (!node) throw new Error(`Unknown node: ${id}`)
  return node
}

export function findEdge(graph: Graph, a: NodeId, b: NodeId): GraphEdge {
  const edge = graph.edges.find(
    (e) => (e.source === a && e.target === b) || (e.source === b && e.target === a),
  )
  if (!edge) throw new Error(`No edge between ${a} and ${b}`)
  return edge
}

export function emptyGraph(): Graph {
  return { nodes: [], edges: [], start: '', goal: '' }
}

/** A graph is runnable once it has at least one node and a valid start/goal. */
export function isValidGraph(graph: Graph): boolean {
  return (
    graph.nodes.length > 0 &&
    graph.nodes.some((n) => n.id === graph.start) &&
    graph.nodes.some((n) => n.id === graph.goal)
  )
}

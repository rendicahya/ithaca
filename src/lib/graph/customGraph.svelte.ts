import { emptyGraph } from './types'
import type { Graph, GraphEdge, GraphNode, NodeId } from './types'

const STORAGE_KEY = 'ithaca-custom-graph'

function loadFromStorage(): Graph {
  if (typeof window === 'undefined') return emptyGraph()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyGraph()
    const parsed = JSON.parse(raw) as Partial<Graph>
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return emptyGraph()
    return {
      nodes: parsed.nodes,
      edges: parsed.edges,
      start: parsed.start ?? '',
      goal: parsed.goal ?? '',
    }
  } catch {
    return emptyGraph()
  }
}

function nextNodeId(existing: GraphNode[]): NodeId {
  const used = new Set(existing.map((n) => n.id))
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let round = 0; ; round++) {
    for (const letter of letters) {
      const id = round === 0 ? letter : `${letter}${round}`
      if (!used.has(id)) return id
    }
  }
}

/**
 * Editable graph state for the "Custom Graph" example — lets a lecturer
 * build their own search graph interactively instead of using the two fixed
 * teaching graphs. Persisted to localStorage so it survives a page reload.
 */
export class CustomGraphStore {
  graph = $state<Graph>(loadFromStorage())
  selectedNodeId = $state<NodeId | null>(null)
  selectedEdgeId = $state<string | null>(null)

  private persist(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.graph))
    } catch {
      // Storage unavailable (private browsing, quota) — editing still works
      // for the session, it just won't survive a reload.
    }
  }

  addNode(x: number, y: number): void {
    const id = nextNodeId(this.graph.nodes)
    const node: GraphNode = { id, label: id, x, y, heuristic: 0 }
    const isFirst = this.graph.nodes.length === 0
    this.graph = {
      ...this.graph,
      nodes: [...this.graph.nodes, node],
      start: isFirst ? id : this.graph.start,
      goal: isFirst ? id : this.graph.goal,
    }
    this.selectedNodeId = id
    this.selectedEdgeId = null
    this.persist()
  }

  removeNode(id: NodeId): void {
    const nodes = this.graph.nodes.filter((n) => n.id !== id)
    const edges = this.graph.edges.filter((e) => e.source !== id && e.target !== id)
    this.graph = {
      ...this.graph,
      nodes,
      edges,
      start: this.graph.start === id ? (nodes[0]?.id ?? '') : this.graph.start,
      goal: this.graph.goal === id ? (nodes[0]?.id ?? '') : this.graph.goal,
    }
    if (this.selectedNodeId === id) this.selectedNodeId = null
    this.persist()
  }

  setNodePosition(id: NodeId, x: number, y: number): void {
    this.graph = {
      ...this.graph,
      nodes: this.graph.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    }
    this.persist()
  }

  setNodeHeuristic(id: NodeId, heuristic: number): void {
    this.graph = {
      ...this.graph,
      nodes: this.graph.nodes.map((n) => (n.id === id ? { ...n, heuristic } : n)),
    }
    this.persist()
  }

  setStart(id: NodeId): void {
    this.graph = { ...this.graph, start: id }
    this.persist()
  }

  setGoal(id: NodeId): void {
    this.graph = { ...this.graph, goal: id }
    this.persist()
  }

  addEdge(source: NodeId, target: NodeId): void {
    if (source === target) return
    const exists = this.graph.edges.some(
      (e) => (e.source === source && e.target === target) || (e.source === target && e.target === source),
    )
    if (exists) return
    const id = `${source}-${target}`
    const edge: GraphEdge = { id, source, target, cost: 1 }
    this.graph = { ...this.graph, edges: [...this.graph.edges, edge] }
    this.selectedEdgeId = id
    this.selectedNodeId = null
    this.persist()
  }

  removeEdge(id: string): void {
    this.graph = { ...this.graph, edges: this.graph.edges.filter((e) => e.id !== id) }
    if (this.selectedEdgeId === id) this.selectedEdgeId = null
    this.persist()
  }

  setEdgeCost(id: string, cost: number): void {
    this.graph = {
      ...this.graph,
      edges: this.graph.edges.map((e) => (e.id === id ? { ...e, cost } : e)),
    }
    this.persist()
  }

  selectNode(id: NodeId): void {
    this.selectedNodeId = id
    this.selectedEdgeId = null
  }

  selectEdge(id: string): void {
    this.selectedEdgeId = id
    this.selectedNodeId = null
  }

  clearSelection(): void {
    this.selectedNodeId = null
    this.selectedEdgeId = null
  }

  loadTemplate(template: Graph): void {
    this.graph = {
      nodes: template.nodes.map((n) => ({ ...n })),
      edges: template.edges.map((e) => ({ ...e })),
      start: template.start,
      goal: template.goal,
    }
    this.clearSelection()
    this.persist()
  }

  clear(): void {
    this.graph = emptyGraph()
    this.clearSelection()
    this.persist()
  }
}

export const customGraphStore = new CustomGraphStore()

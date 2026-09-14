import { beforeEach, describe, expect, it } from 'vitest'

import { CustomGraphStore } from '../customGraph.svelte'
import { isValidGraph } from '../types'

describe('CustomGraphStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts empty and invalid to run', () => {
    const store = new CustomGraphStore()
    expect(store.graph.nodes).toHaveLength(0)
    expect(isValidGraph(store.graph)).toBe(false)
  })

  it('makes the first node both start and goal', () => {
    const store = new CustomGraphStore()
    store.addNode(0, 0)
    expect(store.graph.nodes).toHaveLength(1)
    const id = store.graph.nodes[0].id
    expect(store.graph.start).toBe(id)
    expect(store.graph.goal).toBe(id)
    expect(isValidGraph(store.graph)).toBe(true)
  })

  it('assigns sequential letter ids and does not touch start/goal for later nodes', () => {
    const store = new CustomGraphStore()
    store.addNode(0, 0)
    store.addNode(100, 0)
    store.addNode(200, 0)
    expect(store.graph.nodes.map((n) => n.id)).toEqual(['A', 'B', 'C'])
    expect(store.graph.start).toBe('A')
    expect(store.graph.goal).toBe('A')
  })

  it('connects two nodes with a default-cost edge, ignoring duplicates and self-loops', () => {
    const store = new CustomGraphStore()
    store.addNode(0, 0)
    store.addNode(100, 0)
    const [a, b] = store.graph.nodes.map((n) => n.id)

    store.addEdge(a, b)
    expect(store.graph.edges).toHaveLength(1)
    expect(store.graph.edges[0].cost).toBe(1)

    store.addEdge(b, a) // reverse of an existing edge
    store.addEdge(a, b) // exact duplicate
    expect(store.graph.edges).toHaveLength(1)

    store.addEdge(a, a) // self-loop
    expect(store.graph.edges).toHaveLength(1)
  })

  it('updates heuristic and cost', () => {
    const store = new CustomGraphStore()
    store.addNode(0, 0)
    store.addNode(100, 0)
    const [a, b] = store.graph.nodes.map((n) => n.id)
    store.addEdge(a, b)
    const edgeId = store.graph.edges[0].id

    store.setNodeHeuristic(a, 7)
    store.setEdgeCost(edgeId, 5)

    expect(store.graph.nodes.find((n) => n.id === a)?.heuristic).toBe(7)
    expect(store.graph.edges.find((e) => e.id === edgeId)?.cost).toBe(5)
  })

  it('removing a node also removes its edges and reassigns start/goal if needed', () => {
    const store = new CustomGraphStore()
    store.addNode(0, 0)
    store.addNode(100, 0)
    const [a, b] = store.graph.nodes.map((n) => n.id)
    store.addEdge(a, b)
    store.setGoal(b)

    store.removeNode(b)

    expect(store.graph.nodes.map((n) => n.id)).toEqual([a])
    expect(store.graph.edges).toHaveLength(0)
    expect(store.graph.goal).toBe(a)
  })

  it('clears back to an empty graph', () => {
    const store = new CustomGraphStore()
    store.addNode(0, 0)
    store.addNode(100, 0)
    store.clear()
    expect(store.graph.nodes).toHaveLength(0)
    expect(store.graph.edges).toHaveLength(0)
    expect(store.graph.start).toBe('')
    expect(store.graph.goal).toBe('')
  })

  it('persists across instances via localStorage', () => {
    const store = new CustomGraphStore()
    store.addNode(0, 0)
    store.addNode(100, 0)
    const [a, b] = store.graph.nodes.map((n) => n.id)
    store.addEdge(a, b)

    const reloaded = new CustomGraphStore()
    expect(reloaded.graph.nodes.map((n) => n.id)).toEqual([a, b])
    expect(reloaded.graph.edges).toHaveLength(1)
  })

  it('loadTemplate deep-clones so mutating the store never mutates the template', () => {
    const store = new CustomGraphStore()
    const template = {
      nodes: [{ id: 'X', label: 'X', x: 0, y: 0, heuristic: 0 }],
      edges: [],
      start: 'X',
      goal: 'X',
    }
    store.loadTemplate(template)
    store.setNodeHeuristic('X', 42)
    expect(template.nodes[0].heuristic).toBe(0)
  })
})

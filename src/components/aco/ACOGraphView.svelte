<script lang="ts">
  import {
    Background,
    BackgroundVariant,
    Position,
    SvelteFlow,
    type Edge,
    type Node,
  } from '@xyflow/svelte'
  import '@xyflow/svelte/dist/style.css'

  import GraphZoomControls from '@/components/visualization/GraphZoomControls.svelte'
  import { acoGraph } from '@/lib/algorithms/aco'
  import type { ACOState } from '@/lib/algorithms/aco/types'

  import ACOGraphEdge from './ACOGraphEdge.svelte'
  import type { ACOEdgeData } from './ACOGraphEdge.svelte'
  import ACOGraphNode from './ACOGraphNode.svelte'
  import type { ACONodeData, ACONodeStatus } from './ACOGraphNode.svelte'

  interface Props {
    state: ACOState
  }

  let { state }: Props = $props()

  const graph = acoGraph

  const currentAnt = $derived(state.ants.find((a) => a.id === state.currentAntId && !a.reachedGoal) ?? null)

  const visitedNodeIds = $derived.by(() => {
    const ids = new Set<string>()
    for (const ant of state.ants) for (const id of ant.nodes) ids.add(id)
    return ids
  })

  function statusFor(id: string): ACONodeStatus {
    if (state.done && state.globalBestPath?.includes(id)) return 'best'
    if (currentAnt && currentAnt.nodes[currentAnt.nodes.length - 1] === id) return 'current'
    if (visitedNodeIds.has(id)) return 'visited'
    return 'default'
  }

  const chosenEdgeId = $derived(
    currentAnt && currentAnt.edges.length > 0 ? currentAnt.edges[currentAnt.edges.length - 1] : null,
  )

  const traversedEdgeIds = $derived.by(() => {
    const ids = new Set<string>()
    for (const ant of state.ants) for (const edgeId of ant.edges) ids.add(edgeId)
    return ids
  })

  const bestEdgeIds = $derived.by(() => {
    const ids = new Set<string>()
    if (state.done && state.globalBestPath) {
      const path = state.globalBestPath
      for (let i = 0; i < path.length - 1; i++) {
        const edge = graph.edges.find((e) => e.source === path[i] && e.target === path[i + 1])
        if (edge) ids.add(edge.id)
      }
    }
    return ids
  })

  const maxPheromone = $derived(Math.max(1, ...Object.values(state.pheromone)))

  function edgeStatus(edgeId: string): ACOEdgeData['status'] {
    if (state.done && bestEdgeIds.has(edgeId)) return 'best'
    if (edgeId === chosenEdgeId) return 'chosen'
    if (traversedEdgeIds.has(edgeId)) return 'traversed'
    return 'default'
  }

  const nodes = $derived<Node[]>(
    graph.nodes.map((n) => ({
      id: n.id,
      type: 'acoNode',
      position: { x: n.x, y: n.y },
      draggable: false,
      selectable: false,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: n.label,
        status: statusFor(n.id),
        isStart: n.id === graph.start,
        isGoal: n.id === graph.goal,
      } satisfies ACONodeData,
    })),
  )

  const edges = $derived<Edge[]>(
    graph.edges.map((e) => ({
      id: e.id,
      type: 'acoEdge',
      source: e.source,
      target: e.target,
      selectable: false,
      data: {
        cost: e.cost,
        status: edgeStatus(e.id),
        intensity: Math.min(1, state.pheromone[e.id] / maxPheromone),
      } satisfies ACOEdgeData,
    })),
  )

  const nodeTypes = { acoNode: ACOGraphNode }
  const edgeTypes = { acoEdge: ACOGraphEdge }
</script>

<div class="h-full w-full">
  <SvelteFlow
    {nodes}
    {edges}
    {nodeTypes}
    {edgeTypes}
    fitView
    fitViewOptions={{ padding: 0.15 }}
    nodesDraggable={false}
    nodesConnectable={false}
    elementsSelectable={false}
    panOnScroll
    zoomOnScroll={false}
    zoomOnPinch
    proOptions={{ hideAttribution: true }}
    minZoom={0.5}
    maxZoom={1.5}
  >
    <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
    <GraphZoomControls />
  </SvelteFlow>
</div>

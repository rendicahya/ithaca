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

  import type { FrontierKind, SearchState } from '@/lib/algorithms/search/types'
  import type { Graph } from '@/lib/graph/types'

  import type { AlgoEdgeData } from './GraphEdge.svelte'
  import GraphEdge from './GraphEdge.svelte'
  import type { AlgoNodeData } from './GraphNode.svelte'
  import GraphNode from './GraphNode.svelte'
  import GraphZoomControls from './GraphZoomControls.svelte'

  interface Props {
    graph: Graph
    state: SearchState
    frontierKind: FrontierKind
  }

  let { graph, state, frontierKind }: Props = $props()

  const showScores = $derived(frontierKind !== 'queue' && frontierKind !== 'stack')
  const showG = $derived(frontierKind === 'priority-g' || frontierKind === 'priority-f')
  const showH = $derived(frontierKind === 'priority-h' || frontierKind === 'priority-f')
  const showF = $derived(frontierKind === 'priority-f')

  function statusFor(id: string): AlgoNodeData['status'] {
    if (state.done && state.found && state.path.includes(id)) return 'path'
    if (state.currentNode === id) return 'current'
    if (state.frontier.includes(id)) return 'frontier'
    if (state.visited.includes(id)) return 'visited'
    return 'unvisited'
  }

  const pathEdgeIds = $derived.by(() => {
    const ids = new Set<string>()
    if (state.done && state.found) {
      for (let i = 0; i < state.path.length - 1; i++) {
        const a = state.path[i]
        const b = state.path[i + 1]
        const edge = graph.edges.find(
          (e) => (e.source === a && e.target === b) || (e.source === b && e.target === a),
        )
        if (edge) ids.add(edge.id)
      }
    }
    return ids
  })

  const sourcePosition = $derived(graph.layout === 'vertical' ? Position.Bottom : Position.Right)
  const targetPosition = $derived(graph.layout === 'vertical' ? Position.Top : Position.Left)

  const nodes = $derived<Node[]>(
    graph.nodes.map((n) => ({
      id: n.id,
      type: 'algoNode',
      position: { x: n.x, y: n.y },
      draggable: false,
      selectable: false,
      sourcePosition,
      targetPosition,
      data: {
        label: n.label,
        status: statusFor(n.id),
        isStart: n.id === graph.start,
        isGoal: n.id === graph.goal,
        g: showG ? state.gScore?.[n.id] : undefined,
        h: showH ? state.hScore?.[n.id] : undefined,
        f: showF ? state.fScore?.[n.id] : undefined,
        showScores,
      } satisfies AlgoNodeData,
    })),
  )

  function edgeStatus(edgeId: string): AlgoEdgeData['status'] {
    if (pathEdgeIds.has(edgeId)) return 'path'
    if (state.expandingEdgeIds.includes(edgeId)) return 'expanding'
    return 'default'
  }

  const edges = $derived<Edge[]>(
    graph.edges.map((e) => ({
      id: e.id,
      type: 'algoEdge',
      source: e.source,
      target: e.target,
      selectable: false,
      data: {
        cost: e.cost,
        status: edgeStatus(e.id),
      } satisfies AlgoEdgeData,
    })),
  )

  const nodeTypes = { algoNode: GraphNode }
  const edgeTypes = { algoEdge: GraphEdge }
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

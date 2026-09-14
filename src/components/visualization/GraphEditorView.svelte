<script lang="ts">
  import {
    Background,
    BackgroundVariant,
    ConnectionMode,
    SvelteFlow,
    type Connection,
    type Edge,
    type Node,
  } from '@xyflow/svelte'
  import '@xyflow/svelte/dist/style.css'

  import type { CustomGraphStore } from '@/lib/graph/customGraph.svelte'

  import EditableGraphEdge from './EditableGraphEdge.svelte'
  import type { EditableEdgeData } from './EditableGraphEdge.svelte'
  import EditableGraphNode from './EditableGraphNode.svelte'
  import type { EditableNodeData } from './EditableGraphNode.svelte'
  import GraphZoomControls from './GraphZoomControls.svelte'

  interface Props {
    store: CustomGraphStore
  }

  let { store }: Props = $props()

  function buildNodes(): Node[] {
    return store.graph.nodes.map((n) => ({
      id: n.id,
      type: 'editableNode',
      position: { x: n.x, y: n.y },
      draggable: true,
      selectable: true,
      selected: store.selectedNodeId === n.id,
      data: {
        label: n.label,
        heuristic: n.heuristic,
        isStart: n.id === store.graph.start,
        isGoal: n.id === store.graph.goal,
      } satisfies EditableNodeData,
    }))
  }

  function buildEdges(): Edge[] {
    return store.graph.edges.map((e) => ({
      id: e.id,
      type: 'editableEdge',
      source: e.source,
      target: e.target,
      selectable: true,
      selected: store.selectedEdgeId === e.id,
      data: { cost: e.cost } satisfies EditableEdgeData,
    }))
  }

  let nodes = $state<Node[]>(buildNodes())
  let edges = $state<Edge[]>(buildEdges())

  // Re-sync the canvas from the domain store whenever it changes for reasons
  // other than an in-progress drag (add/remove/heuristic/cost/start/goal).
  // The store never changes mid-drag (position is only committed on
  // dragstop), so this can't fight with Svelte Flow's own live drag feedback.
  $effect(() => {
    nodes = buildNodes()
  })
  $effect(() => {
    edges = buildEdges()
  })

  function handleConnect(connection: Connection): void {
    store.addEdge(connection.source, connection.target)
  }

  function handleNodeDragStop({ nodes: dragged }: { nodes: Node[] }): void {
    for (const node of dragged) {
      store.setNodePosition(node.id, node.position.x, node.position.y)
    }
  }

  function handleNodeClick({ node }: { node: Node }): void {
    store.selectNode(node.id)
  }

  function handleEdgeClick({ edge }: { edge: Edge }): void {
    store.selectEdge(edge.id)
  }

  function handlePaneClick(): void {
    store.clearSelection()
  }

  const nodeTypes = { editableNode: EditableGraphNode }
  const edgeTypes = { editableEdge: EditableGraphEdge }
</script>

<div class="h-full w-full">
  <SvelteFlow
    bind:nodes
    bind:edges
    {nodeTypes}
    {edgeTypes}
    fitView
    fitViewOptions={{ padding: 0.3 }}
    connectionMode={ConnectionMode.Loose}
    deleteKey={null}
    nodesDraggable
    nodesConnectable
    elementsSelectable
    panOnScroll
    zoomOnScroll={false}
    zoomOnPinch
    proOptions={{ hideAttribution: true }}
    minZoom={0.3}
    maxZoom={1.5}
    onconnect={handleConnect}
    onnodedragstop={handleNodeDragStop}
    onnodeclick={handleNodeClick}
    onedgeclick={handleEdgeClick}
    onpaneclick={handlePaneClick}
  >
    <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
    <GraphZoomControls />
  </SvelteFlow>
</div>

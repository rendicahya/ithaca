<script lang="ts">
  import { graphlib, layout as dagreLayout } from '@dagrejs/dagre'
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
  import { termToString } from '@/lib/prolog/terms'
  import type { ProofState } from '@/lib/prolog/types'

  import ProofTreeNode from './ProofTreeNode.svelte'
  import type { ProofNodeData } from './ProofTreeNode.svelte'

  interface Props {
    state: ProofState
  }

  let { state }: Props = $props()

  const NODE_WIDTH = 170
  const NODE_HEIGHT = 40

  // The proof tree is generated dynamically (its shape depends on how the
  // search unfolds), so — unlike the hand-designed search graphs — automatic
  // layout genuinely earns its keep here.
  const positions = $derived.by(() => {
    const g = new graphlib.Graph()
    g.setGraph({ rankdir: 'TB', nodesep: 20, ranksep: 48 })
    g.setDefaultEdgeLabel(() => ({}))
    for (const node of state.treeNodes) {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
    }
    for (const edge of state.treeEdges) {
      g.setEdge(edge.source, edge.target)
    }
    dagreLayout(g)
    return g
  })

  const nodes = $derived<Node[]>(
    state.treeNodes.map((n) => {
      const pos = positions.node(n.id) as { x: number; y: number } | undefined
      return {
        id: n.id,
        type: 'proofNode',
        position: { x: (pos?.x ?? 0) - NODE_WIDTH / 2, y: (pos?.y ?? 0) - NODE_HEIGHT / 2 },
        draggable: false,
        selectable: false,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        data: {
          label: termToString(n.term, state.bindings),
          status: n.status,
        } satisfies ProofNodeData,
      }
    }),
  )

  const edges = $derived<Edge[]>(
    state.treeEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      selectable: false,
      type: 'smoothstep',
      class: 'stroke-border',
    })),
  )

  const nodeTypes = { proofNode: ProofTreeNode }
</script>

<div class="h-full w-full">
  <SvelteFlow
    {nodes}
    {edges}
    {nodeTypes}
    fitView
    fitViewOptions={{ padding: 0.2 }}
    nodesDraggable={false}
    nodesConnectable={false}
    elementsSelectable={false}
    panOnScroll
    zoomOnScroll={false}
    zoomOnPinch
    proOptions={{ hideAttribution: true }}
    minZoom={0.3}
    maxZoom={1.5}
  >
    <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
    <GraphZoomControls />
  </SvelteFlow>
</div>

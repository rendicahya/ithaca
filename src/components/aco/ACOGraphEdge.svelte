<script lang="ts" module>
  export type ACOEdgeStatus = 'default' | 'traversed' | 'chosen' | 'best'

  export interface ACOEdgeData {
    cost: number
    status: ACOEdgeStatus
    /** Pheromone level normalized to [0, 1] against the strongest edge — drives stroke width/opacity. */
    intensity: number
    [key: string]: unknown
  }
</script>

<script lang="ts">
  import { BaseEdge, EdgeLabel, getBezierPath, type EdgeProps } from '@xyflow/svelte'

  import { cn } from '@/lib/utils'

  let { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps =
    $props()
  const d = $derived(data as unknown as ACOEdgeData)

  const layout = $derived.by(() =>
    getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      curvature: 0.15,
    }),
  )

  // Pheromone strength drives line thickness: faint for a near-empty trail,
  // thick for a heavily reinforced one — the same trail metaphor as real ants.
  const width = $derived(1.5 + d.intensity * 5)
</script>

<BaseEdge
  path={layout[0]}
  class={cn(
    'transition-all duration-300',
    d.status === 'best' && 'stroke-node-path',
    d.status === 'chosen' && 'stroke-node-current [stroke-dasharray:6_4] animate-[dash-flow_0.6s_linear_infinite]',
    d.status === 'traversed' && 'stroke-node-frontier',
    d.status === 'default' && 'stroke-border',
  )}
  style={`stroke-width: ${d.status === 'chosen' ? Math.max(width, 2) : width}px`}
/>
<EdgeLabel x={layout[1]} y={layout[2]}>
  <div
    class={cn(
      'rounded border bg-card px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-sm',
      d.status === 'best' && 'border-node-path text-node-path',
      d.status === 'chosen' && 'border-node-current text-node-current',
      d.status === 'traversed' && 'border-node-frontier text-node-frontier',
      d.status === 'default' && 'border-border text-muted-foreground',
    )}
  >
    {d.cost}
  </div>
</EdgeLabel>

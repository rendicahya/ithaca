<script lang="ts" module>
  export type AlgoEdgeStatus = 'default' | 'expanding' | 'path'

  export interface AlgoEdgeData {
    cost: number
    status: AlgoEdgeStatus
    [key: string]: unknown
  }
</script>

<script lang="ts">
  import { BaseEdge, EdgeLabel, getBezierPath, type EdgeProps } from '@xyflow/svelte'

  import { cn } from '@/lib/utils'

  let { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps =
    $props()
  const d = $derived(data as unknown as AlgoEdgeData)

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
</script>

<BaseEdge
  path={layout[0]}
  class={cn(
    'transition-all duration-300',
    d.status === 'path' && 'stroke-node-path',
    d.status === 'expanding' && 'stroke-node-current [stroke-dasharray:6_4] animate-[dash-flow_0.6s_linear_infinite]',
    d.status === 'default' && 'stroke-border',
  )}
  style={d.status === 'path' ? 'stroke-width: 3px' : d.status === 'expanding' ? 'stroke-width: 2px' : 'stroke-width: 1.5px'}
/>
<EdgeLabel x={layout[1]} y={layout[2]}>
  <div
    class={cn(
      'rounded border bg-card px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-sm',
      d.status === 'path' && 'border-node-path text-node-path',
      d.status === 'expanding' && 'border-node-current text-node-current',
      d.status === 'default' && 'border-border text-muted-foreground',
    )}
  >
    {d.cost}
  </div>
</EdgeLabel>

<script lang="ts" module>
  export interface EditableEdgeData {
    cost: number
    [key: string]: unknown
  }
</script>

<script lang="ts">
  import { BaseEdge, EdgeLabel, getBezierPath, type EdgeProps } from '@xyflow/svelte'

  import { cn } from '@/lib/utils'

  let { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected }: EdgeProps =
    $props()
  const d = $derived(data as unknown as EditableEdgeData)

  const layout = $derived.by(() =>
    getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, curvature: 0.2 }),
  )
</script>

<BaseEdge
  path={layout[0]}
  class={cn('transition-colors', selected ? 'stroke-primary' : 'stroke-border')}
  style={selected ? 'stroke-width: 2.5px' : 'stroke-width: 1.5px'}
/>
<EdgeLabel x={layout[1]} y={layout[2]}>
  <div
    class={cn(
      'rounded border bg-card px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-sm',
      selected ? 'border-primary text-primary' : 'border-border text-muted-foreground',
    )}
  >
    {d.cost}
  </div>
</EdgeLabel>

<script lang="ts" module>
  export interface EditableNodeData {
    label: string
    heuristic: number
    isStart: boolean
    isGoal: boolean
    [key: string]: unknown
  }
</script>

<script lang="ts">
  import { Handle, Position, type NodeProps } from '@xyflow/svelte'

  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  let { data, selected }: NodeProps = $props()
  const d = $derived(data as unknown as EditableNodeData)

  // Every compass point exposes both a source and a target handle (stacked)
  // so an edge can be dragged starting or ending on any side, in any
  // direction — needed for a free-form, user-arranged graph.
  const compassPositions = [Position.Top, Position.Right, Position.Bottom, Position.Left]
</script>

<div class="group relative flex flex-col items-center">
  <div
    class={cn(
      'flex size-16 flex-col items-center justify-center rounded-full border-2 bg-card font-mono shadow-sm transition-colors',
      selected ? 'border-primary ring-4 ring-primary/25' : 'border-border',
      !selected && d.isStart && 'border-node-start',
      !selected && d.isGoal && 'border-node-goal',
    )}
  >
    <span class="text-sm font-bold leading-none">{d.label}</span>
    <span class="mt-0.5 text-[9px] text-muted-foreground">h={d.heuristic}</span>
  </div>
  {#if d.isStart || d.isGoal}
    <span class="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {d.isStart ? localeStore.t('node.start') : localeStore.t('node.goal')}
    </span>
  {/if}

  {#each compassPositions as pos (pos)}
    <Handle
      type="source"
      position={pos}
      id={`${pos}-source`}
      class="!size-2.5 !border-2 !border-background !bg-primary opacity-0 transition-opacity group-hover:opacity-100"
    />
    <Handle
      type="target"
      position={pos}
      id={`${pos}-target`}
      class="!size-2.5 !border-0 !bg-transparent"
    />
  {/each}
</div>

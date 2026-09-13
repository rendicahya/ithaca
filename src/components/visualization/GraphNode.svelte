<script lang="ts" module>
  import type { NodeStatus } from '@/lib/algorithms/search/types'

  export interface AlgoNodeData {
    label: string
    status: NodeStatus
    isStart: boolean
    isGoal: boolean
    g?: number
    h?: number
    f?: number
    showScores: boolean
    [key: string]: unknown
  }
</script>

<script lang="ts">
  import { Handle, Position, type NodeProps } from '@xyflow/svelte'

  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  let { data, sourcePosition = Position.Right, targetPosition = Position.Left }: NodeProps =
    $props()
  const d = $derived(data as unknown as AlgoNodeData)

  const statusClasses: Record<NodeStatus, string> = {
    unvisited: 'bg-node-unvisited text-node-unvisited-foreground border-border',
    frontier: 'bg-node-frontier text-node-frontier-foreground border-node-frontier',
    current:
      'bg-node-current text-node-current-foreground border-node-current ring-4 ring-node-current/25',
    visited: 'bg-node-visited text-node-visited-foreground border-node-visited',
    path: 'bg-node-path text-node-path-foreground border-node-path',
  }
</script>

<div class="relative flex flex-col items-center">
  <div
    class={cn(
      'flex flex-col items-center justify-center rounded-full border-2 font-mono shadow-sm transition-colors duration-300',
      d.showScores ? 'size-20' : 'size-16',
      statusClasses[d.status],
    )}
  >
    <span class="text-sm font-bold leading-none">{d.label}</span>
    {#if d.showScores}
      <div class="mt-0.5 flex flex-col items-center leading-tight">
        {#if d.g !== undefined}<span class="text-[9px] opacity-90">g={d.g}</span>{/if}
        {#if d.h !== undefined}<span class="text-[9px] opacity-90">h={d.h}</span>{/if}
        {#if d.f !== undefined}<span class="text-[9px] font-semibold">f={d.f}</span>{/if}
      </div>
    {/if}
  </div>
  {#if d.isStart || d.isGoal}
    <span class="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {d.isStart ? localeStore.t('node.start') : localeStore.t('node.goal')}
    </span>
  {/if}

  <Handle type="target" position={targetPosition} class="!size-1 !border-0 !bg-transparent" />
  <Handle type="source" position={sourcePosition} class="!size-1 !border-0 !bg-transparent" />
</div>

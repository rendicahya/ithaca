<script lang="ts" module>
  export type ACONodeStatus = 'default' | 'current' | 'visited' | 'best'

  export interface ACONodeData {
    label: string
    status: ACONodeStatus
    isStart: boolean
    isGoal: boolean
    [key: string]: unknown
  }
</script>

<script lang="ts">
  import { Handle, Position, type NodeProps } from '@xyflow/svelte'

  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  let { data, sourcePosition = Position.Right, targetPosition = Position.Left }: NodeProps =
    $props()
  const d = $derived(data as unknown as ACONodeData)

  const statusClasses: Record<ACONodeStatus, string> = {
    default: 'bg-node-unvisited text-node-unvisited-foreground border-border',
    visited: 'bg-node-visited text-node-visited-foreground border-node-visited',
    current:
      'bg-node-current text-node-current-foreground border-node-current ring-4 ring-node-current/25',
    best: 'bg-node-path text-node-path-foreground border-node-path',
  }
</script>

<div class="relative flex flex-col items-center">
  <div
    class={cn(
      'flex size-16 items-center justify-center rounded-full border-2 font-mono shadow-sm transition-colors duration-300',
      statusClasses[d.status],
    )}
  >
    <span class="text-sm font-bold leading-none">{d.label}</span>
  </div>
  {#if d.isStart || d.isGoal}
    <span class="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {d.isStart ? localeStore.t('node.start') : localeStore.t('node.goal')}
    </span>
  {/if}

  <Handle type="target" position={targetPosition} class="!size-1 !border-0 !bg-transparent" />
  <Handle type="source" position={sourcePosition} class="!size-1 !border-0 !bg-transparent" />
</div>

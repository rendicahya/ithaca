<script lang="ts" module>
  import type { ProofNodeStatus } from '@/lib/prolog/types'

  export interface ProofNodeData {
    label: string
    status: ProofNodeStatus
    [key: string]: unknown
  }
</script>

<script lang="ts">
  import { Handle, Position, type NodeProps } from '@xyflow/svelte'

  import { cn } from '@/lib/utils'

  let { data }: NodeProps = $props()
  const d = $derived(data as unknown as ProofNodeData)

  const statusClasses: Record<ProofNodeStatus, string> = {
    pending: 'bg-node-unvisited text-node-unvisited-foreground border-border opacity-70',
    current:
      'bg-node-current text-node-current-foreground border-node-current ring-4 ring-node-current/25',
    success: 'bg-node-path text-node-path-foreground border-node-path',
    failed: 'bg-destructive text-destructive-foreground border-destructive',
    backtracked:
      'bg-node-visited text-node-visited-foreground border-node-visited opacity-50 line-through',
  }
</script>

<div
  class={cn(
    'max-w-52 truncate rounded-md border-2 px-3 py-1.5 font-mono text-xs shadow-sm transition-colors duration-300',
    statusClasses[d.status],
  )}
  title={d.label}
>
  {d.label}
  <Handle type="target" position={Position.Top} class="!size-1 !border-0 !bg-transparent" />
  <Handle type="source" position={Position.Bottom} class="!size-1 !border-0 !bg-transparent" />
</div>

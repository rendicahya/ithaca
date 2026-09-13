<script lang="ts">
  import type { SearchAlgorithm, SearchState } from '@/lib/algorithms/search/types'
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'

  import PriorityQueueView from './PriorityQueueView.svelte'
  import QueueView from './QueueView.svelte'
  import StackView from './StackView.svelte'

  interface Props {
    state: SearchState
    algorithm: SearchAlgorithm
  }

  let { state, algorithm }: Props = $props()

  const priorityItems = $derived(
    state.frontier.map((id) => ({
      id,
      g: state.gScore?.[id],
      h: state.hScore?.[id],
      f: state.fScore?.[id],
    })),
  )

  const orderBy = $derived(
    algorithm.frontierKind === 'priority-g'
      ? ('g' as const)
      : algorithm.frontierKind === 'priority-h'
        ? ('h' as const)
        : ('f' as const),
  )
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      Current Node
    </h3>
    {#if state.currentNode}
      <Badge variant="default" class="font-mono text-sm">{state.currentNode}</Badge>
    {:else}
      <span class="text-sm text-muted-foreground">—</span>
    {/if}
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {algorithm.frontierLabel}
    </h3>
    {#if algorithm.frontierKind === 'queue'}
      <QueueView items={state.frontier} />
    {:else if algorithm.frontierKind === 'stack'}
      <StackView items={state.frontier} />
    {:else}
      <PriorityQueueView items={priorityItems} {orderBy} />
    {/if}
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      Visited ({state.visited.length})
    </h3>
    {#if state.visited.length === 0}
      <span class="text-sm text-muted-foreground">—</span>
    {:else}
      <div class="flex flex-wrap gap-1.5">
        {#each state.visited as id (id)}
          <Badge variant="muted" class="font-mono">{id}</Badge>
        {/each}
      </div>
    {/if}
  </section>

  {#if state.done && state.found}
    <Separator />
    <section>
      <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Final Path
      </h3>
      <p class="font-mono text-sm font-semibold text-node-path">
        {state.path.join(' → ')}
      </p>
      <p class="mt-1 text-xs text-muted-foreground">Path cost: {state.pathCost}</p>
    </section>
  {/if}
</div>

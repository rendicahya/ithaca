<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import type { KNNState } from '@/lib/algorithms/knn/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  interface Props {
    state: KNNState
  }

  let { state }: Props = $props()

  const maxVotes = $derived(Math.max(1, ...Object.values(state.votes)))
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <div class="flex flex-wrap items-center gap-2">
    <Badge variant="default" class="font-mono">k = {state.k}</Badge>
    <Badge variant="outline" class="font-mono">
      {localeStore.t('knn.query')}: ({state.query.x}, {state.query.y})
    </Badge>
  </div>

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('knn.distances')}
    </h3>
    <div class="flex flex-col gap-1">
      {#each state.points as entry (entry.point.id)}
        <div
          class={cn(
            'flex items-center gap-2 rounded-md border px-2 py-1 font-mono text-xs',
            entry.point.id === state.currentPointId
              ? 'border-node-current bg-node-current/10'
              : entry.isNeighbor
                ? 'border-node-frontier bg-node-frontier/10'
                : 'border-border bg-card',
          )}
        >
          <Badge variant="secondary" class="w-9 shrink-0 justify-center font-mono">
            {entry.point.id}
          </Badge>
          <span class="text-muted-foreground">({entry.point.x}, {entry.point.y})</span>
          <span class="text-muted-foreground">{localeStore.t('knn.classLabel')}: {entry.point.label}</span>
          <span class="ml-auto shrink-0 font-semibold">
            {entry.distance !== null ? entry.distance.toFixed(2) : '—'}
          </span>
        </div>
      {/each}
    </div>
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('knn.votes')}
    </h3>
    <div class="flex flex-col gap-1.5">
      {#each state.classNames as className (className)}
        <div class="flex items-center gap-2 font-mono text-xs">
          <span
            class={cn(
              'w-6 shrink-0 font-semibold',
              className === state.currentClass && 'text-node-current',
            )}
          >
            {className}
          </span>
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full bg-node-frontier"
              style={`width: ${(state.votes[className] / maxVotes) * 100}%`}
            ></div>
          </div>
          <span class="w-4 shrink-0 text-right text-muted-foreground">{state.votes[className]}</span>
        </div>
      {/each}
    </div>
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('knn.prediction')}
    </h3>
    {#if state.predictedClass}
      <p class="font-mono text-sm font-semibold text-node-path">{state.predictedClass}</p>
    {:else}
      <span class="text-sm text-muted-foreground">{localeStore.t('common.noneYet')}</span>
    {/if}
  </section>
</div>

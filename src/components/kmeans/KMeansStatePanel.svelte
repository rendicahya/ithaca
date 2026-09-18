<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import type { KMeansState } from '@/lib/algorithms/kmeans/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  interface Props {
    state: KMeansState
  }

  let { state }: Props = $props()

  const CLUSTER_BADGE_CLASSES = [
    'border-node-start text-node-start',
    'border-node-goal text-node-goal',
    'border-node-frontier text-node-frontier',
  ]

  const clusterCounts = $derived.by(() => {
    const counts = new Array(state.k).fill(0)
    for (const p of state.points) if (p.cluster >= 0) counts[p.cluster] += 1
    return counts
  })
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <div class="flex flex-wrap items-center gap-2">
    <Badge variant="default" class="font-mono">
      {localeStore.t('kmeans.iteration')}: {Math.min(state.iteration, state.maxIterations)} / {state.maxIterations}
    </Badge>
    <Badge variant="outline" class="font-mono">k = {state.k}</Badge>
    {#if state.converged}
      <Badge variant="muted" class="font-mono">{localeStore.t('kmeans.convergedBadge')}</Badge>
    {/if}
  </div>

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('kmeans.centroids')}
    </h3>
    <div class="flex flex-col gap-1.5">
      {#each state.centroids as centroid, i (i)}
        <div class={cn('flex items-center gap-2 rounded-md border bg-card px-2 py-1 font-mono text-xs', CLUSTER_BADGE_CLASSES[i])}>
          <span class="font-semibold">C{i + 1}</span>
          <span>({centroid.x.toFixed(2)}, {centroid.y.toFixed(2)})</span>
          <span class="ml-auto text-muted-foreground">{clusterCounts[i]} {localeStore.t('kmeans.points')}</span>
        </div>
      {/each}
    </div>
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('kmeans.lastChange')}
    </h3>
    {#if state.changedCount !== null}
      <p class="font-mono text-sm">{state.changedCount} {localeStore.t('kmeans.pointsChanged')}</p>
    {:else}
      <span class="text-sm text-muted-foreground">{localeStore.t('common.noneYet')}</span>
    {/if}
  </section>

  {#if state.done}
    <Separator />
    <section>
      <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {localeStore.t('kmeans.result')}
      </h3>
      <p class="text-xs text-muted-foreground">
        {state.converged
          ? localeStore.t('kmeans.resultConverged')
          : localeStore.t('kmeans.resultExhausted')}
      </p>
    </section>
  {/if}
</div>

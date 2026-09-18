<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import { acoGraph } from '@/lib/algorithms/aco'
  import { pathToString } from '@/lib/algorithms/aco/types'
  import type { ACOState } from '@/lib/algorithms/aco/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'

  interface Props {
    state: ACOState
  }

  let { state }: Props = $props()

  const sortedPheromone = $derived(
    acoGraph.edges
      .map((e) => ({ id: e.id, value: state.pheromone[e.id] }))
      .sort((a, b) => b.value - a.value),
  )

  const currentAnt = $derived(state.ants.find((a) => a.id === state.currentAntId) ?? null)
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <div class="flex flex-wrap items-center gap-2">
    <Badge variant="default" class="font-mono">
      {localeStore.t('aco.iteration')}: {Math.min(state.iteration, state.maxIterations)} / {state.maxIterations}
    </Badge>
    <Badge variant="outline" class="font-mono">α={state.alpha}</Badge>
    <Badge variant="outline" class="font-mono">β={state.beta}</Badge>
    <Badge variant="outline" class="font-mono">ρ={state.evaporationRate}</Badge>
  </div>

  {#if currentAnt}
    <section>
      <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {localeStore.t('aco.currentAnt')}
      </h3>
      <p class="font-mono text-sm">
        <span class="font-semibold">{currentAnt.id}</span>: {pathToString(currentAnt.nodes)}
        {#if currentAnt.reachedGoal}
          <span class="ml-1 text-muted-foreground">({localeStore.t('aco.cost')}: {currentAnt.cost})</span>
        {/if}
      </p>
    </section>
  {/if}

  {#if state.candidates}
    <Separator />
    <section>
      <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {localeStore.t('aco.candidates')}
      </h3>
      <div class="flex flex-col gap-1">
        {#each state.candidates as c (c.edgeId)}
          <div class="flex items-center justify-between rounded-md border border-border bg-card px-2 py-1 font-mono text-xs">
            <span class="font-semibold">→ {c.targetId}</span>
            <span class="text-muted-foreground">τ={c.pheromone.toFixed(2)} η={c.heuristic.toFixed(2)}</span>
            <span class="font-semibold text-node-current">{(c.probability * 100).toFixed(0)}%</span>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('aco.pheromoneLevels')}
    </h3>
    <div class="flex flex-col gap-1">
      {#each sortedPheromone as edge (edge.id)}
        <div class="flex items-center gap-2 font-mono text-xs">
          <span class="w-14 shrink-0 text-muted-foreground">{edge.id}</span>
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full bg-node-frontier"
              style={`width: ${Math.min(100, (edge.value / sortedPheromone[0].value) * 100)}%`}
            ></div>
          </div>
          <span class="w-10 shrink-0 text-right text-muted-foreground">{edge.value.toFixed(2)}</span>
        </div>
      {/each}
    </div>
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('aco.bestPath')}
    </h3>
    {#if state.globalBestPath}
      <p class="font-mono text-sm font-semibold text-node-path">{pathToString(state.globalBestPath)}</p>
      <p class="mt-1 text-xs text-muted-foreground">
        {localeStore.t('aco.cost')}: {state.globalBestCost}
      </p>
    {:else}
      <span class="text-sm text-muted-foreground">{localeStore.t('common.noneYet')}</span>
    {/if}
  </section>
</div>

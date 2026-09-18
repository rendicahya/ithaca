<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import ZoomControls from '@/components/visualization/ZoomControls.svelte'
  import type { GAState } from '@/lib/algorithms/genetic/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { msg } from '@/lib/i18n/translate'
  import { ZoomState } from '@/lib/zoom.svelte'

  import GeneRow from './GeneRow.svelte'

  interface Props {
    state: GAState
  }

  let { state }: Props = $props()

  const zoom = new ZoomState()

  function ringFor(id: string): 'parent' | 'best' | null {
    if (state.parentA?.id === id || state.parentB?.id === id) return 'parent'
    if (state.done && state.bestChromosome?.id === id) return 'best'
    return null
  }

  function isCandidate(id: string): boolean {
    return (
      state.tournamentCandidatesA.some((c) => c.id === id) ||
      state.tournamentCandidatesB.some((c) => c.id === id)
    )
  }

  const point = $derived(state.crossoverPoint)
  const originA = $derived(
    (i: number) => (point !== null && i < point ? 'border-t-node-start' : 'border-t-node-goal'),
  )
  const originB = $derived(
    (i: number) => (point !== null && i < point ? 'border-t-node-goal' : 'border-t-node-start'),
  )
</script>

<div class="relative h-full">
  <ZoomControls
    zoom={zoom.level}
    canZoomIn={zoom.canZoomIn}
    canZoomOut={zoom.canZoomOut}
    onZoomIn={zoom.zoomIn}
    onZoomOut={zoom.zoomOut}
    onReset={zoom.reset}
  />
  <div
    class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin"
    style={`zoom: ${zoom.level}`}
  >
    <div class="flex flex-wrap items-center gap-2">
      <Badge variant="default" class="font-mono">
        {localeStore.t('genetic.generation')}: {state.generation} / {state.maxGenerations}
      </Badge>
      <Badge variant="outline" class="font-mono">
        {localeStore.t('genetic.target')}: {state.targetFitness}
      </Badge>
      <Badge variant="muted" class="font-mono">
        {localeStore.t('genetic.bestEver')}: {state.bestFitnessEver}
      </Badge>
    </div>

    <section>
      <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {localeStore.t('genetic.population')}
      </h3>
      <div class="flex flex-col gap-1.5">
        {#each state.population as c (c.id)}
          <GeneRow
            id={c.id}
            genes={c.genes}
            fitness={c.fitness}
            maxFitness={state.chromosomeLength}
            ring={ringFor(c.id)}
            badgeVariant={isCandidate(c.id) && !ringFor(c.id) ? 'outline' : 'secondary'}
          />
        {/each}
      </div>
    </section>

    {#if state.offspring}
      <Separator />
      <section>
        <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {localeStore.t('genetic.parents')} → {localeStore.t('genetic.offspring')}
        </h3>
        <div class="flex flex-col gap-1.5 rounded-md border border-border bg-card p-2">
          {#if state.parentA}
            <GeneRow
              id={state.parentA.id}
              genes={state.parentA.genes}
              fitness={state.parentA.fitness}
              maxFitness={state.chromosomeLength}
              badgeVariant="outline"
            />
          {/if}
          {#if state.parentB}
            <GeneRow
              id={state.parentB.id}
              genes={state.parentB.genes}
              fitness={state.parentB.fitness}
              maxFitness={state.chromosomeLength}
              badgeVariant="outline"
            />
          {/if}
          <Separator />
          <GeneRow
            id={state.offspring[0].id}
            genes={state.offspring[0].genes}
            fitness={state.offspring[0].fitness}
            maxFitness={state.chromosomeLength}
            originClass={originA}
            mutatedIndices={state.mutatedIndices[0]}
          />
          <GeneRow
            id={state.offspring[1].id}
            genes={state.offspring[1].genes}
            fitness={state.offspring[1].fitness}
            maxFitness={state.chromosomeLength}
            originClass={originB}
            mutatedIndices={state.mutatedIndices[1]}
          />
        </div>
        <p class="mt-1.5 text-xs text-muted-foreground">
          {localeStore.t('genetic.crossoverPoint')}: {state.crossoverPoint ?? '—'}
        </p>
      </section>
    {/if}

    {#if state.newPopulation.length > 0}
      <Separator />
      <section>
        <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {localeStore.t('genetic.newPopulation')} ({state.newPopulation.length}/{state.population
            .length})
        </h3>
        <div class="flex flex-col gap-1.5">
          {#each state.newPopulation as c (c.id)}
            <GeneRow id={c.id} genes={c.genes} fitness={c.fitness} maxFitness={state.chromosomeLength} />
          {/each}
        </div>
      </section>
    {/if}

    {#if state.done}
      <Separator />
      <section>
        <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {localeStore.t('genetic.result')}
        </h3>
        <p class="mb-1.5 text-xs text-muted-foreground">
          {state.found
            ? localeStore.t('genetic.resultFound')
            : localeStore.t(msg('genetic.resultExhausted', { gen: state.generation }))}
        </p>
        {#if state.bestChromosome}
          <GeneRow
            id={state.bestChromosome.id}
            genes={state.bestChromosome.genes}
            fitness={state.bestChromosome.fitness}
            maxFitness={state.chromosomeLength}
            ring="best"
          />
        {/if}
      </section>
    {/if}
  </div>
</div>

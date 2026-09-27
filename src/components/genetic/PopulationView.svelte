<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import ZoomControls from '@/components/visualization/ZoomControls.svelte'
  import type { GAState } from '@/lib/algorithms/genetic/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { msg } from '@/lib/i18n/translate'
  import { ZoomState } from '@/lib/zoom.svelte'

  import GeneRow from './GeneRow.svelte'
  import GeneticIllustration from './GeneticIllustration.svelte'

  interface Props {
    state: GAState
  }

  let { state }: Props = $props()

  const zoom = new ZoomState()
  const binary = $derived(state.exampleId === 'knapsack')

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

  // Single-point crossover splits at one index; order crossover copies a
  // contiguous segment — both reduce to "is gene i inside the copied range".
  const inCopiedRange = $derived((i: number) => {
    const [p0, p1] = state.crossoverPoints
    if (state.crossoverKind === 'point') return i < p0
    if (state.crossoverKind === 'segment') return i >= p0 && i < p1
    return false
  })
  const originA = $derived((i: number) =>
    inCopiedRange(i) ? 'border-t-node-start' : 'border-t-node-goal',
  )
  const originB = $derived((i: number) =>
    inCopiedRange(i) ? 'border-t-node-goal' : 'border-t-node-start',
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
    <GeneticIllustration {state} />

    <div class="flex flex-wrap items-center gap-2">
      <Badge variant="default" class="font-mono">
        {localeStore.t('genetic.generation')}: {state.generation} / {state.maxGenerations}
      </Badge>
      <Badge variant="muted" class="font-mono">
        {localeStore.t('genetic.bestEver')}: {state.bestChromosome ? state.bestFitnessEver : '—'}
      </Badge>
      <Badge variant="outline" class="font-mono">
        {localeStore.t('genetic.crossoverRate')}: {state.crossoverRate}
      </Badge>
      <Badge variant="outline" class="font-mono">
        {localeStore.t('genetic.mutationRate')}: {state.mutationRate}
      </Badge>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
              evaluated={c.evaluated}
              {binary}
              ring={ringFor(c.id)}
              badgeVariant={isCandidate(c.id) && !ringFor(c.id) ? 'outline' : 'secondary'}
            />
          {/each}
        </div>
      </section>

      <section>
        <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {localeStore.t('genetic.newPopulation')} ({state.newPopulation.length}/{state.population
            .length})
        </h3>
        {#if state.newPopulation.length > 0}
          <div class="flex flex-col gap-1.5">
            {#each state.newPopulation as c (c.id)}
              <GeneRow
                id={c.id}
                genes={c.genes}
                fitness={c.fitness}
                evaluated={c.evaluated}
                {binary}
              />
            {/each}
          </div>
        {:else}
          <p class="text-xs text-muted-foreground">{localeStore.t('common.noneYet')}</p>
        {/if}
      </section>
    </div>

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
              evaluated={state.parentA.evaluated}
              {binary}
              badgeVariant="outline"
            />
          {/if}
          {#if state.parentB}
            <GeneRow
              id={state.parentB.id}
              genes={state.parentB.genes}
              fitness={state.parentB.fitness}
              evaluated={state.parentB.evaluated}
              {binary}
              badgeVariant="outline"
            />
          {/if}
          <Separator />
          <GeneRow
            id={state.offspring[0].id}
            genes={state.offspring[0].genes}
            fitness={state.offspring[0].fitness}
            evaluated={state.offspring[0].evaluated}
            {binary}
            originClass={originA}
            mutatedIndices={state.mutatedIndices[0]}
          />
          <GeneRow
            id={state.offspring[1].id}
            genes={state.offspring[1].genes}
            fitness={state.offspring[1].fitness}
            evaluated={state.offspring[1].evaluated}
            {binary}
            originClass={originB}
            mutatedIndices={state.mutatedIndices[1]}
          />
        </div>
        <p class="mt-1.5 text-xs text-muted-foreground">
          {localeStore.t('genetic.crossoverPoint')}: {state.crossoverPoints.length > 0
            ? state.crossoverPoints.join('–')
            : '—'}
        </p>
      </section>
    {/if}

    {#if state.done}
      <Separator />
      <section>
        <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {localeStore.t('genetic.result')}
        </h3>
        <p class="mb-1.5 text-xs text-muted-foreground">
          {localeStore.t(msg('genetic.resultExhausted', { gen: state.generation }))}
        </p>
        {#if state.bestChromosome}
          <GeneRow
            id={state.bestChromosome.id}
            genes={state.bestChromosome.genes}
            fitness={state.bestChromosome.fitness}
            evaluated={state.bestChromosome.evaluated}
            {binary}
            ring="best"
          />
        {/if}
      </section>
    {/if}
  </div>
</div>

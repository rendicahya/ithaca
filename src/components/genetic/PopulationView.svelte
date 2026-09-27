<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import ZoomControls from '@/components/visualization/ZoomControls.svelte'
  import type { Chromosome, GAState } from '@/lib/algorithms/genetic/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { msg } from '@/lib/i18n/translate'
  import { ZoomState } from '@/lib/zoom.svelte'

  import GeneRow from './GeneRow.svelte'
  import GeneticIllustration from './GeneticIllustration.svelte'

  interface Props {
    state: GAState
  }

  // Renamed from `state` to avoid colliding with the `$state` rune below —
  // Svelte treats `$state` as a store-auto-subscription on a variable
  // literally named `state`, not as the rune, when one is in scope.
  let { state: gaState }: Props = $props()

  const zoom = new ZoomState()
  const binary = $derived(gaState.exampleId === 'knapsack')

  // Lets a lecturer click any chromosome to inspect it in the illustration
  // above (its route on the map, or its packed items). Keyed by section+id
  // rather than just id, since ids like "C1" are reused across the
  // population, new population, parents and offspring.
  let selectedKey = $state<string | null>(null)
  let selectedChromosome = $state<Chromosome | null>(null)

  function toggleSelect(key: string, c: Chromosome): void {
    if (selectedKey === key) {
      selectedKey = null
      selectedChromosome = null
    } else {
      selectedKey = key
      selectedChromosome = c
    }
  }

  // A selected chromosome belongs to a specific step's population; once the
  // lecturer steps forward or backward, clear it rather than keep pointing
  // at stale genes that may no longer be on screen.
  $effect(() => {
    gaState
    selectedKey = null
    selectedChromosome = null
  })

  function ringFor(id: string): 'parent' | 'best' | null {
    if (gaState.parentA?.id === id || gaState.parentB?.id === id) return 'parent'
    if (gaState.done && gaState.bestChromosome?.id === id) return 'best'
    return null
  }

  function isCandidate(id: string): boolean {
    return (
      gaState.tournamentCandidatesA.some((c) => c.id === id) ||
      gaState.tournamentCandidatesB.some((c) => c.id === id)
    )
  }

  // Single-point crossover splits at one index; order crossover copies a
  // contiguous segment — both reduce to "is gene i inside the copied range".
  const inCopiedRange = $derived((i: number) => {
    const [p0, p1] = gaState.crossoverPoints
    if (gaState.crossoverKind === 'point') return i < p0
    if (gaState.crossoverKind === 'segment') return i >= p0 && i < p1
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
    <GeneticIllustration state={gaState} {selectedChromosome} />

    <div class="flex flex-wrap items-center gap-2">
      <Badge variant="default" class="font-mono">
        {localeStore.t('genetic.generation')}: {gaState.generation} / {gaState.maxGenerations}
      </Badge>
      <Badge variant="muted" class="font-mono">
        {localeStore.t('genetic.bestEver')}: {gaState.bestChromosome ? gaState.bestFitnessEver : '—'}
      </Badge>
      <Badge variant="outline" class="font-mono">
        {localeStore.t('genetic.crossoverRate')}: {gaState.crossoverRate}
      </Badge>
      <Badge variant="outline" class="font-mono">
        {localeStore.t('genetic.mutationRate')}: {gaState.mutationRate}
      </Badge>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section>
        <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {localeStore.t('genetic.population')}
        </h3>
        <div class="flex flex-col gap-1.5">
          {#each gaState.population as c (c.id)}
            <GeneRow
              id={c.id}
              genes={c.genes}
              fitness={c.fitness}
              evaluated={c.evaluated}
              {binary}
              ring={ringFor(c.id)}
              badgeVariant={isCandidate(c.id) && !ringFor(c.id) ? 'outline' : 'secondary'}
              selected={selectedKey === `population:${c.id}`}
              onSelect={() => toggleSelect(`population:${c.id}`, c)}
            />
          {/each}
        </div>
      </section>

      <section>
        <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {localeStore.t('genetic.newPopulation')} ({gaState.newPopulation.length}/{gaState.population
            .length})
        </h3>
        {#if gaState.newPopulation.length > 0}
          <div class="flex flex-col gap-1.5">
            {#each gaState.newPopulation as c (c.id)}
              <GeneRow
                id={c.id}
                genes={c.genes}
                fitness={c.fitness}
                evaluated={c.evaluated}
                {binary}
                selected={selectedKey === `newPopulation:${c.id}`}
                onSelect={() => toggleSelect(`newPopulation:${c.id}`, c)}
              />
            {/each}
          </div>
        {:else}
          <p class="text-xs text-muted-foreground">{localeStore.t('common.noneYet')}</p>
        {/if}
      </section>
    </div>

    {#if gaState.offspring}
      <Separator />
      <section>
        <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {localeStore.t('genetic.parents')} → {localeStore.t('genetic.offspring')}
        </h3>
        <div class="flex flex-col gap-1.5 rounded-md border border-border bg-card p-2">
          {#if gaState.parentA}
            <GeneRow
              id={gaState.parentA.id}
              genes={gaState.parentA.genes}
              fitness={gaState.parentA.fitness}
              evaluated={gaState.parentA.evaluated}
              {binary}
              badgeVariant="outline"
              selected={selectedKey === 'parentA'}
              onSelect={() => toggleSelect('parentA', gaState.parentA as Chromosome)}
            />
          {/if}
          {#if gaState.parentB}
            <GeneRow
              id={gaState.parentB.id}
              genes={gaState.parentB.genes}
              fitness={gaState.parentB.fitness}
              evaluated={gaState.parentB.evaluated}
              {binary}
              badgeVariant="outline"
              selected={selectedKey === 'parentB'}
              onSelect={() => toggleSelect('parentB', gaState.parentB as Chromosome)}
            />
          {/if}
          <Separator />
          <GeneRow
            id={gaState.offspring[0].id}
            genes={gaState.offspring[0].genes}
            fitness={gaState.offspring[0].fitness}
            evaluated={gaState.offspring[0].evaluated}
            {binary}
            originClass={originA}
            mutatedIndices={gaState.mutatedIndices[0]}
            selected={selectedKey === 'offspringA'}
            onSelect={() =>
              toggleSelect('offspringA', (gaState.offspring as [Chromosome, Chromosome])[0])}
          />
          <GeneRow
            id={gaState.offspring[1].id}
            genes={gaState.offspring[1].genes}
            fitness={gaState.offspring[1].fitness}
            evaluated={gaState.offspring[1].evaluated}
            {binary}
            originClass={originB}
            mutatedIndices={gaState.mutatedIndices[1]}
            selected={selectedKey === 'offspringB'}
            onSelect={() =>
              toggleSelect('offspringB', (gaState.offspring as [Chromosome, Chromosome])[1])}
          />
        </div>
        <p class="mt-1.5 text-xs text-muted-foreground">
          {localeStore.t('genetic.crossoverPoint')}: {gaState.crossoverPoints.length > 0
            ? gaState.crossoverPoints.join('–')
            : '—'}
        </p>
      </section>
    {/if}

    {#if gaState.done}
      <Separator />
      <section>
        <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {localeStore.t('genetic.result')}
        </h3>
        <p class="mb-1.5 text-xs text-muted-foreground">
          {localeStore.t(msg('genetic.resultExhausted', { gen: gaState.generation }))}
        </p>
        {#if gaState.bestChromosome}
          <GeneRow
            id={gaState.bestChromosome.id}
            genes={gaState.bestChromosome.genes}
            fitness={gaState.bestChromosome.fitness}
            evaluated={gaState.bestChromosome.evaluated}
            {binary}
            ring="best"
            selected={selectedKey === 'best'}
            onSelect={() => toggleSelect('best', gaState.bestChromosome as Chromosome)}
          />
        {/if}
      </section>
    {/if}
  </div>
</div>

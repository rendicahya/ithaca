<script lang="ts">
  import { Gem, Weight } from '@lucide/svelte'

  import { Badge } from '@/components/ui/badge'
  import {
    KNAPSACK_CAPACITY,
    KNAPSACK_ITEMS,
    ROUTE_CITIES,
    ROUTE_FITNESS_SCALE,
    knapsackDecode,
    routeDecode,
  } from '@/lib/algorithms/genetic'
  import type { Chromosome, GAState } from '@/lib/algorithms/genetic/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { msg } from '@/lib/i18n/translate'
  import { cn } from '@/lib/utils'

  interface Props {
    state: GAState
    /** Chromosome the lecturer clicked in the population lists, if any. Takes priority over the automatic best-so-far/best-of-generation display. */
    selectedChromosome?: Chromosome | null
  }

  let { state, selectedChromosome = null }: Props = $props()

  const best = $derived(state.bestChromosome)

  // Distinct from `best` (best across all generations): this always tracks
  // a chromosome that is actually in state.population, so the route
  // illustration never shows a tour that has vanished from the screen.
  const currentGenBest = $derived.by(() => {
    if (state.population.length === 0 || !state.population.every((c) => c.evaluated)) return null
    return state.population.reduce((a, b) => (b.fitness > a.fitness ? b : a))
  })

  const routeDisplayed = $derived(selectedChromosome ?? currentGenBest)
  const knapsackSelectedDecoded = $derived(
    selectedChromosome ? knapsackDecode(selectedChromosome.genes) : null,
  )
</script>

<div class="rounded-md border border-border bg-card p-3 text-xs">
  {#if state.exampleId === 'knapsack'}
    <p class="mb-2 text-muted-foreground">
      {localeStore.t(msg('genetic.example.knapsack.description', { capacity: KNAPSACK_CAPACITY }))}
    </p>
    <div class="flex flex-wrap gap-2">
      {#each KNAPSACK_ITEMS as item, i (i)}
        {@const packed = knapsackSelectedDecoded?.includedIndices.includes(i) ?? false}
        <div
          class={cn(
            'flex w-[4.5rem] flex-col gap-1 rounded-md border p-1.5',
            packed ? 'border-primary bg-primary/10' : 'border-border bg-background',
          )}
        >
          <span class="text-center text-[10px] font-semibold text-muted-foreground">
            {localeStore.t(msg('genetic.knapsack.item', { n: i + 1 }))}
          </span>
          <div class="flex items-center justify-between font-mono text-[11px]">
            <span
              class="flex items-center gap-0.5 text-muted-foreground"
              title={localeStore.t('genetic.knapsack.weight')}
            >
              <Weight class="size-3" />{item.weight}
            </span>
            <span
              class="flex items-center gap-0.5 text-node-path"
              title={localeStore.t('genetic.knapsack.value')}
            >
              <Gem class="size-3" />{item.value}
            </span>
          </div>
        </div>
      {/each}
    </div>
    <p class="mt-1.5 text-[10px] text-muted-foreground">
      <span class="inline-flex items-center gap-0.5"><Weight class="size-3" /> {localeStore.t('genetic.knapsack.weight')}</span>
      ·
      <span class="inline-flex items-center gap-0.5 text-node-path"><Gem class="size-3" /> {localeStore.t('genetic.knapsack.value')}</span>
    </p>
    {#if selectedChromosome}
      {@const decoded = knapsackSelectedDecoded}
      {@const overCapacity = (decoded?.weight ?? 0) > KNAPSACK_CAPACITY}
      <p class="mt-2 font-mono text-muted-foreground">
        <span class="font-semibold text-primary">
          {localeStore.t(msg('genetic.selectedChromosome', { id: selectedChromosome.id }))}
        </span>
        —
        {localeStore.t('genetic.knapsack.packed')}:
        {decoded && decoded.includedIndices.length > 0
          ? decoded.includedIndices
              .map((i) => localeStore.t(msg('genetic.knapsack.item', { n: i + 1 })))
              .join(', ')
          : localeStore.t('genetic.knapsack.none')}
        (<span class={overCapacity ? 'font-semibold text-destructive' : ''}
          >{decoded?.weight}</span
        >/{KNAPSACK_CAPACITY} kg · {localeStore.t('genetic.knapsack.value')} {decoded?.value} ·
        {localeStore.t('genetic.fitness')} {selectedChromosome.fitness})
        {#if overCapacity}
          <span class="text-destructive">— {localeStore.t('genetic.knapsack.overCapacity')}</span>
        {/if}
      </p>
    {:else if best?.evaluated}
      {@const decoded = knapsackDecode(best.genes)}
      <p class="mt-2 font-mono text-muted-foreground">
        <span class="font-semibold text-node-path">{localeStore.t('genetic.bestEver')}</span> —
        {localeStore.t('genetic.knapsack.packed')}:
        {decoded.includedIndices.length > 0
          ? decoded.includedIndices
              .map((i) => localeStore.t(msg('genetic.knapsack.item', { n: i + 1 })))
              .join(', ')
          : localeStore.t('genetic.knapsack.none')}
        ({decoded.weight}/{KNAPSACK_CAPACITY} kg · {localeStore.t('genetic.knapsack.value')} {decoded.value}
        · {localeStore.t('genetic.fitness')} {best.fitness})
      </p>
    {/if}
  {:else}
    <p class="mb-2 text-muted-foreground">
      {localeStore.t(msg('genetic.example.route.description', { count: ROUTE_CITIES.length }))}
    </p>
    <p class="mb-2 text-muted-foreground">
      {localeStore.t(
        msg('genetic.route.explanation', {
          x: 'x',
          y: 'y',
          x0: ROUTE_CITIES[0].x,
          y0: ROUTE_CITIES[0].y,
        }),
      )}
    </p>
    {@const minX = Math.min(...ROUTE_CITIES.map((c) => c.x))}
    {@const maxX = Math.max(...ROUTE_CITIES.map((c) => c.x))}
    {@const minY = Math.min(...ROUTE_CITIES.map((c) => -c.y))}
    {@const maxY = Math.max(...ROUTE_CITIES.map((c) => -c.y))}
    {@const pad = 1.5}
    {@const viewBox = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`}
    {@const order = routeDisplayed ? routeDecode(routeDisplayed.genes).order : null}
    <div class="rounded border border-border bg-background p-2">
      <div class="flex flex-wrap gap-1.5">
        {#each ROUTE_CITIES as city, i (i)}
          <Badge variant="outline" class="font-mono text-[10px]">
            {localeStore.t(msg('genetic.route.city', { n: i + 1 }))} ({city.x}, {city.y})
          </Badge>
        {/each}
      </div>
      <svg {viewBox} class="mt-2 h-40 w-full rounded bg-card">
        {#if order}
          {#each order as cityIndex, k (k)}
            {@const from = ROUTE_CITIES[cityIndex]}
            {@const to = ROUTE_CITIES[order[(k + 1) % order.length]]}
            <line
              x1={from.x}
              y1={-from.y}
              x2={to.x}
              y2={-to.y}
              stroke="var(--color-primary)"
              stroke-width="0.15"
            />
          {/each}
        {/if}
        {#each ROUTE_CITIES as city, i (i)}
          <circle cx={city.x} cy={-city.y} r="0.35" class="fill-foreground" />
          <text
            x={city.x}
            y={-city.y - 0.6}
            font-size="0.6"
            text-anchor="middle"
            class="fill-foreground font-mono"
          >
            {i + 1}
          </text>
        {/each}
      </svg>

      {#if routeDisplayed}
        {@const decoded = routeDecode(routeDisplayed.genes)}
        <p class="mt-2 font-mono text-muted-foreground">
          <span class={cn('font-semibold', selectedChromosome ? 'text-primary' : 'text-node-path')}>
            {selectedChromosome
              ? localeStore.t(msg('genetic.selectedChromosome', { id: selectedChromosome.id }))
              : localeStore.t(msg('genetic.route.currentGenBest', { gen: state.generation }))}
          </span>
          —
          {localeStore.t('genetic.route.order')}: {decoded.order.map((i) => `#${i + 1}`).join(' → ')} → #{decoded
            .order[0] + 1}
          · {localeStore.t('genetic.route.distance')}: {decoded.distance.toFixed(1)}
          · {localeStore.t('genetic.fitness')}: {routeDisplayed.evaluated ? routeDisplayed.fitness : '?'}
        </p>
      {/if}
    </div>
    <p class="mt-2 text-muted-foreground">
      {localeStore.t(msg('genetic.route.fitnessExplanation', { scale: ROUTE_FITNESS_SCALE }))}
    </p>
  {/if}
</div>

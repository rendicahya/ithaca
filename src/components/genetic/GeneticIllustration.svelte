<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import {
    KNAPSACK_CAPACITY,
    KNAPSACK_ITEMS,
    ROUTE_CITIES,
    ROUTE_FITNESS_SCALE,
    knapsackDecode,
    routeDecode,
  } from '@/lib/algorithms/genetic'
  import type { GAState } from '@/lib/algorithms/genetic/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { msg } from '@/lib/i18n/translate'

  interface Props {
    state: GAState
  }

  let { state }: Props = $props()

  const best = $derived(state.bestChromosome)
</script>

<div class="rounded-md border border-border bg-card p-3 text-xs">
  {#if state.exampleId === 'knapsack'}
    <p class="mb-2 text-muted-foreground">
      {localeStore.t(msg('genetic.example.knapsack.description', { capacity: KNAPSACK_CAPACITY }))}
    </p>
    <div class="flex flex-wrap gap-1.5">
      {#each KNAPSACK_ITEMS as item, i (i)}
        <Badge variant="outline" class="font-mono">
          {localeStore.t(msg('genetic.knapsack.item', { n: i + 1 }))}: {item.weight}/{item.value}
        </Badge>
      {/each}
    </div>
    {#if best?.evaluated}
      {@const decoded = knapsackDecode(best.genes)}
      <p class="mt-2 font-mono text-muted-foreground">
        {localeStore.t('genetic.knapsack.packed')}:
        {decoded.includedIndices.length > 0
          ? decoded.includedIndices
              .map((i) => localeStore.t(msg('genetic.knapsack.item', { n: i + 1 })))
              .join(', ')
          : localeStore.t('genetic.knapsack.none')}
        ({decoded.weight}/{KNAPSACK_CAPACITY} kg · {localeStore.t('genetic.knapsack.value')} {decoded.value})
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
    <div class="flex flex-wrap gap-1.5">
      {#each ROUTE_CITIES as city, i (i)}
        <Badge variant="outline" class="font-mono">
          {localeStore.t(msg('genetic.route.city', { n: i + 1 }))} ({city.x}, {city.y})
        </Badge>
      {/each}
    </div>

    {@const minX = Math.min(...ROUTE_CITIES.map((c) => c.x))}
    {@const maxX = Math.max(...ROUTE_CITIES.map((c) => c.x))}
    {@const minY = Math.min(...ROUTE_CITIES.map((c) => -c.y))}
    {@const maxY = Math.max(...ROUTE_CITIES.map((c) => -c.y))}
    {@const pad = 1.5}
    {@const viewBox = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`}
    {@const order = best?.evaluated ? routeDecode(best.genes).order : null}
    <svg {viewBox} class="mt-2 h-40 w-full rounded border border-border bg-background">
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

    {#if best?.evaluated}
      {@const decoded = routeDecode(best.genes)}
      <p class="mt-2 font-mono text-muted-foreground">
        {localeStore.t('genetic.route.order')}: {decoded.order.map((i) => `#${i + 1}`).join(' → ')} → #{decoded
          .order[0] + 1}
        · {localeStore.t('genetic.route.distance')}: {decoded.distance.toFixed(1)}
      </p>
    {/if}
    <p class="mt-2 text-muted-foreground">
      {localeStore.t(msg('genetic.route.fitnessExplanation', { scale: ROUTE_FITNESS_SCALE }))}
    </p>
  {/if}
</div>

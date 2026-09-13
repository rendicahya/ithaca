<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import type { GAState } from '@/lib/algorithms/genetic/types'
  import { genesToString } from '@/lib/algorithms/genetic/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'

  interface Props {
    state: GAState
  }

  let { state }: Props = $props()
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('genetic.generation')}
    </h3>
    <Badge variant="default" class="font-mono text-sm">
      {state.generation} / {state.maxGenerations}
    </Badge>
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('genetic.parents')}
    </h3>
    {#if state.parentA && state.parentB}
      <p class="font-mono text-sm">
        {state.parentA.id} ({genesToString(state.parentA.genes)}, f={state.parentA.fitness}) +
        {state.parentB.id} ({genesToString(state.parentB.genes)}, f={state.parentB.fitness})
      </p>
    {:else}
      <span class="text-sm text-muted-foreground">{localeStore.t('common.noneYet')}</span>
    {/if}
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('genetic.crossoverPoint')}
    </h3>
    <span class="font-mono text-sm">{state.crossoverPoint ?? '—'}</span>
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('genetic.mutatedGenes')}
    </h3>
    {#if state.mutatedIndices[0].length === 0 && state.mutatedIndices[1].length === 0}
      <span class="text-sm text-muted-foreground">{localeStore.t('common.noneYet')}</span>
    {:else}
      <p class="font-mono text-sm">
        {#if state.offspring}
          {state.offspring[0].id}: [{state.mutatedIndices[0].join(', ')}] ·
          {state.offspring[1].id}: [{state.mutatedIndices[1].join(', ')}]
        {/if}
      </p>
    {/if}
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('genetic.bestEver')}
    </h3>
    {#if state.bestChromosome}
      <p class="font-mono text-sm font-semibold text-node-path">
        {state.bestChromosome.id} = {genesToString(state.bestChromosome.genes)}
      </p>
      <p class="mt-1 text-xs text-muted-foreground">
        {localeStore.t('genetic.fitness')}: {state.bestFitnessEver} / {state.targetFitness}
      </p>
    {:else}
      <span class="text-sm text-muted-foreground">—</span>
    {/if}
  </section>
</div>

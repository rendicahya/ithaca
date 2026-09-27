<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import type { SelectionState } from '@/lib/algorithms/selection/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'

  interface Props {
    state: SelectionState
  }

  let { state }: Props = $props()
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('selection.totalFitness')}
    </h3>
    <Badge variant="default" class="font-mono text-sm">{state.totalFitness}</Badge>
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('selection.roulette')}
    </h3>
    {#if state.rouletteWinnerId}
      <p class="font-mono text-sm font-semibold text-node-path">{state.rouletteWinnerId}</p>
    {:else}
      <span class="text-sm text-muted-foreground">{localeStore.t('common.noneYet')}</span>
    {/if}
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('selection.tournamentTitle')}
    </h3>
    {#if state.tournamentCandidateIds.length > 0}
      <p class="font-mono text-sm">{localeStore.t('selection.candidates')}: {state.tournamentCandidateIds.join(', ')}</p>
    {:else}
      <span class="text-sm text-muted-foreground">{localeStore.t('common.noneYet')}</span>
    {/if}
    {#if state.tournamentWinnerId}
      <p class="mt-1 font-mono text-sm font-semibold text-node-path">{state.tournamentWinnerId}</p>
    {/if}
  </section>
</div>

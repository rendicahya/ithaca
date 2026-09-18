<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import { linRegDataset } from '@/lib/algorithms/linreg'
  import type { LinRegState } from '@/lib/algorithms/linreg/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'

  interface Props {
    state: LinRegState
  }

  let { state }: Props = $props()
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <div class="flex flex-wrap items-center gap-2">
    <Badge variant="default" class="font-mono">
      {localeStore.t('linreg.epoch')}: {Math.min(state.epoch, state.maxEpochs)} / {state.maxEpochs}
    </Badge>
    <Badge variant="outline" class="font-mono">lr = {state.learningRate}</Badge>
  </div>

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('linreg.equation')}
    </h3>
    <p class="font-mono text-sm">y = {state.m.toFixed(3)}·x + {state.b.toFixed(3)}</p>
    {#if state.loss !== null}
      <p class="mt-1 text-xs text-muted-foreground">{localeStore.t('linreg.loss')}: {state.loss.toFixed(2)}</p>
    {/if}
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('linreg.predictions')}
    </h3>
    <div class="flex flex-col gap-1">
      {#each linRegDataset as point (point.id)}
        {@const predicted = state.m * point.x + state.b}
        <div class="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1 font-mono text-xs">
          <Badge variant="secondary" class="w-9 shrink-0 justify-center font-mono">{point.id}</Badge>
          <span class="text-muted-foreground">y = {point.y}</span>
          <span class="ml-auto shrink-0">ŷ = {predicted.toFixed(1)}</span>
        </div>
      {/each}
    </div>
  </section>

  {#if state.done}
    <Separator />
    <section>
      <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {localeStore.t('linreg.resultLabel')}
      </h3>
      <p class="font-mono text-sm font-semibold text-node-path">
        y = {state.m.toFixed(3)}·x + {state.b.toFixed(3)}
      </p>
    </section>
  {/if}
</div>

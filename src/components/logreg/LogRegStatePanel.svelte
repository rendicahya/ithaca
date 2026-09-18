<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import type { LogRegState } from '@/lib/algorithms/logreg/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  interface Props {
    state: LogRegState
  }

  let { state }: Props = $props()
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <div class="flex flex-wrap items-center gap-2">
    <Badge variant="default" class="font-mono">
      {localeStore.t('logreg.epoch')}: {Math.min(state.epoch, state.maxEpochs)} / {state.maxEpochs}
    </Badge>
    <Badge variant="outline" class="font-mono">lr = {state.learningRate}</Badge>
  </div>

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('logreg.weights')}
    </h3>
    <p class="font-mono text-sm">
      w1 = {state.weights.w1.toFixed(3)}, w2 = {state.weights.w2.toFixed(3)}, b = {state.weights.b.toFixed(3)}
    </p>
    {#if state.loss !== null}
      <p class="mt-1 text-xs text-muted-foreground">{localeStore.t('logreg.loss')}: {state.loss.toFixed(4)}</p>
    {/if}
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('logreg.predictions')}
    </h3>
    <div class="flex flex-col gap-1">
      {#each state.predictions as p (p.point.id)}
        {@const correct = p.predictedLabel === p.point.label}
        <div
          class={cn(
            'flex items-center gap-2 rounded-md border px-2 py-1 font-mono text-xs',
            correct ? 'border-border bg-card' : 'border-destructive bg-destructive/10',
          )}
        >
          <Badge variant="secondary" class="w-9 shrink-0 justify-center font-mono">{p.point.id}</Badge>
          <span class="text-muted-foreground">y = {p.point.label}</span>
          <span class="ml-auto shrink-0">p = {p.probability.toFixed(2)}</span>
        </div>
      {/each}
    </div>
  </section>

  {#if state.done}
    <Separator />
    <section>
      <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {localeStore.t('logreg.resultLabel')}
      </h3>
      <p class="font-mono text-sm font-semibold text-node-path">
        {state.predictions.filter((p) => p.predictedLabel === p.point.label).length} / {state.predictions.length}
        {localeStore.t('logreg.correct')}
      </p>
    </section>
  {/if}
</div>

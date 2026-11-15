<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import { formatLabel, formatNumber } from '@/lib/algorithms/ensemble'
  import type { EnsembleState, Label } from '@/lib/algorithms/ensemble'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  interface Props {
    state: EnsembleState
  }

  let { state }: Props = $props()

  const n = $derived(state.points.length)

  function labelClass(label: Label): string {
    return label === 1 ? 'text-node-start font-semibold' : 'text-node-goal font-semibold'
  }

  const maxWeight = $derived(
    state.method === 'boosting' ? Math.max(...state.weights, ...(state.previousWeights ?? [])) : 1,
  )
</script>

{#snippet heading(key: string)}
  <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
    {localeStore.t(key)}
  </h3>
{/snippet}

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <div class="flex flex-wrap items-center gap-2">
    <Badge variant="default">{localeStore.t(`ensemble.method.${state.method}`)}</Badge>
    <Badge variant="outline" class="font-mono">
      {localeStore.t('ensemble.query')}: ({state.query.x}, {state.query.y})
    </Badge>
  </div>

  {#if state.method === 'bagging'}
    {#if state.sampleCounts && state.current !== null}
      <section>
        {@render heading('ensemble.bootstrapSample')}
        <p class="mb-1.5 font-mono text-xs font-semibold">D{state.current + 1}</p>
        <div class="flex flex-col gap-1">
          {#each state.points as p, i (p.id)}
            {@const count = state.sampleCounts[i]}
            <div
              class={cn(
                'flex items-center gap-2 rounded-md border px-2 py-0.5 font-mono text-xs',
                count === 0 ? 'border-dashed border-border text-muted-foreground' : 'border-border bg-card',
              )}
            >
              <span class="w-8 font-semibold">{p.id}</span>
              <span class={cn('w-6', labelClass(p.label))}>{formatLabel(p.label)}</span>
              <span class="flex flex-1 gap-0.5">
                {#each Array(count) as _, c (c)}
                  <span class="inline-block size-2.5 rounded-sm bg-node-current"></span>
                {/each}
              </span>
              <span class="shrink-0">
                {count === 0 ? localeStore.t('ensemble.notDrawn') : `×${count}`}
              </span>
            </div>
          {/each}
        </div>
      </section>
    {:else}
      <section>
        {@render heading('ensemble.votes')}
        <div class="flex flex-col gap-1">
          {#each state.models as m, i (i)}
            <div class="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1 font-mono text-xs">
              <span class="w-6 font-semibold">f{i + 1}</span>
              <span class="flex-1 text-muted-foreground">
                {localeStore.t({ key: 'ensemble.correct', params: { correct: m.correct, n } })}
              </span>
              {#if m.vote !== null}<span class={labelClass(m.vote)}>{formatLabel(m.vote)}</span>{/if}
            </div>
          {/each}
        </div>
      </section>
    {/if}

    {#if state.ensembleCorrect !== null}
      <Separator />
      <section>
        {@render heading('ensemble.ensembleAccuracy')}
        <p class="font-mono text-sm font-semibold">
          {localeStore.t({ key: 'ensemble.correct', params: { correct: state.ensembleCorrect, n } })}
        </p>
      </section>
    {/if}
  {:else if state.method === 'boosting'}
    <section>
      {@render heading('ensemble.weights')}
      {#if state.previousWeights}
        <p class="mb-1 text-[11px] text-muted-foreground">{localeStore.t('ensemble.weightChange')}</p>
      {/if}
      <div class="flex flex-col gap-1">
        {#each state.points as p, i (p.id)}
          {@const w = state.weights[i]}
          {@const before = state.previousWeights?.[i]}
          {@const wrong = state.misclassified.includes(p.id)}
          <div
            class={cn(
              'flex items-center gap-2 rounded-md border px-2 py-0.5 font-mono text-xs',
              wrong ? 'border-destructive bg-destructive/10' : 'border-border bg-card',
            )}
          >
            <span class="w-8 font-semibold">{p.id}</span>
            <span class={cn('w-6', labelClass(p.label))}>{formatLabel(p.label)}</span>
            <div class="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div class="h-full rounded-full bg-node-current" style={`width:${(w / maxWeight) * 100}%`}></div>
            </div>
            <span class="w-24 shrink-0 text-right">
              {#if before !== undefined}
                <span class="text-muted-foreground">{formatNumber(before, 3)} →</span>
              {/if}
              {formatNumber(w, 3)}
            </span>
          </div>
        {/each}
      </div>
    </section>

    {#if state.rounds.length > 0}
      <Separator />
      <section>
        <table class="w-full font-mono text-xs">
          <thead class="text-muted-foreground">
            <tr>
              <th class="py-1 text-left font-medium">t</th>
              <th class="py-1 text-right font-medium">εₜ</th>
              <th class="py-1 text-right font-medium">αₜ</th>
              <th class="py-1 text-right font-medium" title={localeStore.t('ensemble.accuracyAfterRound')}>F₁..ₜ</th>
            </tr>
          </thead>
          <tbody>
            {#each state.rounds as r, t (t)}
              <tr class={cn('border-t border-border', state.current === t && 'bg-node-current/10')}>
                <td class="py-1 font-semibold">h{t + 1}</td>
                <td class="py-1 text-right">{r.error === null ? '—' : formatNumber(r.error, 3)}</td>
                <td class="py-1 text-right">{r.alpha === null ? '—' : formatNumber(r.alpha, 3)}</td>
                <td class="py-1 text-right">{r.ensembleCorrect === null ? '—' : `${r.ensembleCorrect}/${n}`}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        <p class="mt-1 text-[11px] text-muted-foreground">F₁..ₜ = {localeStore.t('ensemble.accuracyAfterRound')}</p>
      </section>
    {/if}

    {#if state.score !== null}
      <Separator />
      <section>
        {@render heading('ensemble.score')}
        <p class="font-mono text-sm font-semibold">{formatNumber(state.score, 3)}</p>
      </section>
    {/if}
  {:else}
    <section>
      {@render heading('ensemble.metaTrainingSet')}
      <table class="w-full font-mono text-xs">
        <thead class="text-muted-foreground">
          <tr>
            <th class="py-1 text-left font-medium">x</th>
            <th class="py-1 text-center font-medium">{localeStore.t('ensemble.fold')}</th>
            {#each state.baseModels as _, j (j)}
              <th class="py-1 text-center font-medium">f{j + 1}</th>
            {/each}
            <th class="py-1 text-center font-medium">y</th>
          </tr>
        </thead>
        <tbody>
          {#each state.points as p, i (p.id)}
            {@const row = state.metaRows[i]}
            <tr
              class={cn(
                'border-t border-border',
                state.currentFold === state.folds[i] && 'bg-node-current/15',
              )}
            >
              <td class="py-0.5 font-semibold">{p.id}</td>
              <td class="py-0.5 text-center text-muted-foreground">{state.folds[i] + 1}</td>
              {#each state.baseModels as _, j (j)}
                <td class="py-0.5 text-center">
                  {#if row}
                    <span class={cn(labelClass(row[j]), row[j] !== p.label && 'underline decoration-destructive decoration-2')}>
                      {formatLabel(row[j])}
                    </span>
                  {:else}
                    <span class="text-muted-foreground">·</span>
                  {/if}
                </td>
              {/each}
              <td class={cn('py-0.5 text-center', labelClass(p.label))}>{formatLabel(p.label)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>

    {#if state.meta}
      <Separator />
      <section>
        {@render heading('ensemble.metaModel')}
        <div class="flex flex-col gap-1 font-mono text-xs">
          <span><span class="text-muted-foreground">bias:</span> {formatNumber(state.meta.bias)}</span>
          {#each state.meta.weights as w, j (j)}
            <span>
              <span class="text-muted-foreground">w{j + 1} ({localeStore.t(`ensemble.model.${state.baseModels[j].kind}`)}):</span>
              <span class="font-semibold">{formatNumber(w)}</span>
            </span>
          {/each}
          {#if state.metaCorrect !== null}
            <span class="text-muted-foreground">
              Z: {localeStore.t({ key: 'ensemble.correct', params: { correct: state.metaCorrect, n } })}
            </span>
          {/if}
        </div>
      </section>
    {/if}
  {/if}

  <Separator />

  <section>
    {@render heading('ensemble.prediction')}
    {#if state.prediction !== null}
      <p class="font-mono text-sm font-semibold text-node-path">{formatLabel(state.prediction)}</p>
    {:else}
      <span class="text-sm text-muted-foreground">{localeStore.t('common.noneYet')}</span>
    {/if}
  </section>
</div>

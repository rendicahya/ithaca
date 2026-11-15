<script lang="ts">
  import ZoomControls from '@/components/visualization/ZoomControls.svelte'
  import { formatLabel, formatNumber, formatStump } from '@/lib/algorithms/ensemble'
  import type { Classifier, EnsembleState, Label } from '@/lib/algorithms/ensemble'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'
  import { ZoomState } from '@/lib/zoom.svelte'

  import RegionPlot from './RegionPlot.svelte'

  interface Props {
    state: EnsembleState
  }

  let { state }: Props = $props()

  const zoom = new ZoomState()
  const BASE_DISPLAY_SIZE = 440
  const displaySize = $derived(BASE_DISPLAY_SIZE * zoom.level)
  const THUMB = 76

  interface ModelCard {
    name: string
    subtitle: string
    classifier: Classifier | null
    rows: { label: string; value: string }[]
    vote: Label | null
    active: boolean
    /** 0..1 share of the ensemble's say (α or meta weight), drawn as a bar. */
    share?: number
  }

  const cards = $derived.by((): ModelCard[] => {
    const n = state.points.length
    const correct = (c: number | null) =>
      c === null ? '—' : localeStore.t({ key: 'ensemble.correct', params: { correct: c, n } })

    switch (state.method) {
      case 'bagging':
        return state.models.map((m, i) => ({
          name: `f${i + 1}`,
          subtitle: formatStump(m.stump),
          classifier: { kind: 'stump', stump: m.stump },
          rows: [{ label: 'D', value: correct(m.correct) }],
          vote: m.vote,
          active: state.current === i,
        }))
      case 'boosting': {
        const totalAlpha = state.rounds.reduce((s, r) => s + (r.alpha ?? 0), 0)
        return state.rounds.map((r, i) => ({
          name: `h${i + 1}`,
          subtitle: formatStump(r.stump),
          classifier: { kind: 'stump', stump: r.stump },
          rows: [
            { label: `ε${i + 1}`, value: r.error === null ? '—' : formatNumber(r.error, 3) },
            { label: `α${i + 1}`, value: r.alpha === null ? '—' : formatNumber(r.alpha, 3) },
          ],
          vote: r.vote,
          active: state.current === i,
          share: r.alpha === null || totalAlpha === 0 ? undefined : r.alpha / totalAlpha,
        }))
      }
      case 'stacking': {
        const weights = state.meta?.weights
        const totalWeight = weights ? weights.reduce((s, w) => s + Math.abs(w), 0) : 0
        return state.baseModels.map((m, j) => ({
          name: `f${j + 1}`,
          subtitle: localeStore.t(`ensemble.model.${m.kind}`),
          classifier: m.classifier,
          rows: [
            { label: 'D', value: correct(m.correct) },
            { label: `w${j + 1}`, value: weights ? formatNumber(weights[j]) : '—' },
          ],
          vote: m.vote,
          active: false,
          share: weights && totalWeight > 0 ? Math.abs(weights[j]) / totalWeight : undefined,
        }))
      }
    }
  })

  const highlighted = $derived(
    state.method === 'stacking' && state.currentFold !== null
      ? state.points.filter((_, i) => state.folds[i] === state.currentFold).map((p) => p.id)
      : [],
  )

  function voteClass(vote: Label): string {
    return vote === 1
      ? 'border-node-start bg-node-start text-node-start-foreground'
      : 'border-node-goal bg-node-goal text-node-goal-foreground'
  }
</script>

<div class="relative flex h-full w-full overflow-hidden">
  <div class="relative flex min-w-0 flex-1 flex-col">
    <ZoomControls
      zoom={zoom.level}
      canZoomIn={zoom.canZoomIn}
      canZoomOut={zoom.canZoomOut}
      onZoomIn={zoom.zoomIn}
      onZoomOut={zoom.zoomOut}
      onReset={zoom.reset}
    />
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pt-3 pr-40 text-xs">
      <span class="flex items-center gap-1.5">
        <span class="inline-block size-3 rounded-full bg-node-start"></span>
        {localeStore.t('ensemble.legend.positive')}
      </span>
      <span class="flex items-center gap-1.5">
        <span class="inline-block size-3 bg-node-goal"></span>
        {localeStore.t('ensemble.legend.negative')}
      </span>
      <span class="flex items-center gap-1.5">
        <span class="inline-block size-3.5 rounded-full border-2 border-dashed border-destructive"></span>
        {localeStore.t('ensemble.legend.wrong')}
      </span>
      <span class="flex items-center gap-1.5">
        <span class="inline-block size-2.5 rotate-45 border-2 border-node-current"></span>
        {localeStore.t('ensemble.query')}
      </span>
    </div>
    <p class="min-h-6 px-4 pt-1 font-mono text-sm font-semibold">
      {#if state.focusCaption}
        {localeStore.t(state.focusCaption)}
      {:else if state.method === 'stacking' && state.currentFold !== null}
        <span class="text-node-current">
          {localeStore.t({ key: 'ensemble.heldOut', params: { k: state.currentFold + 1 } })}
        </span>
      {/if}
    </p>
    <div class="flex min-h-0 flex-1 items-center justify-center overflow-auto p-2">
      <RegionPlot
        points={state.points}
        query={state.query}
        focus={state.focus}
        misclassified={state.misclassified}
        scale={state.method === 'boosting' ? state.weights : null}
        counts={state.method === 'bagging' ? state.sampleCounts : null}
        {highlighted}
        prediction={state.prediction}
        width={displaySize}
      />
    </div>
  </div>

  <aside class="flex w-64 shrink-0 flex-col gap-2 overflow-y-auto border-l border-border p-3 scrollbar-thin">
    <h3 class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t(state.method === 'stacking' ? 'ensemble.baseModels' : 'ensemble.models')}
    </h3>
    {#each cards as card (card.name)}
      <div
        class={cn(
          'flex gap-2.5 rounded-md border p-2',
          card.active ? 'border-node-current bg-node-current/10' : 'border-border bg-card',
        )}
      >
        <div class="shrink-0 overflow-hidden rounded border border-border bg-background" style={`width:${THUMB}px;height:${THUMB}px`}>
          {#if card.classifier}
            <RegionPlot
              points={state.points}
              query={state.query}
              focus={card.classifier}
              prediction={card.vote}
              compact
              width={THUMB}
            />
          {:else}
            <div class="flex h-full items-center justify-center p-1 text-center text-[10px] leading-tight text-muted-foreground">
              {localeStore.t('ensemble.pending')}
            </div>
          {/if}
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-0.5 font-mono text-xs">
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-bold">{card.name}</span>
            {#if card.vote !== null}
              <span class={cn('ml-auto rounded border px-1.5 text-[11px] font-semibold', voteClass(card.vote))}>
                {formatLabel(card.vote)}
              </span>
            {/if}
          </div>
          <span class="truncate text-muted-foreground" title={card.subtitle}>{card.subtitle}</span>
          {#each card.rows as row (row.label)}
            <span><span class="text-muted-foreground">{row.label}:</span> {row.value}</span>
          {/each}
          {#if card.share !== undefined}
            <div class="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div class="h-full rounded-full bg-node-frontier" style={`width:${card.share * 100}%`}></div>
            </div>
          {/if}
        </div>
      </div>
    {/each}

    {#if state.method === 'stacking'}
      <div class="flex justify-center text-muted-foreground" aria-hidden="true">↓</div>
      <div
        class={cn(
          'rounded-md border p-2 font-mono text-xs',
          state.meta ? 'border-node-path bg-node-path/10' : 'border-dashed border-border',
        )}
      >
        <div class="mb-1 font-sans text-xs font-semibold">{localeStore.t('ensemble.metaModel')}</div>
        {#if state.meta}
          <div>g(z) = σ({formatNumber(state.meta.bias).replace('-', '−')}{#each state.meta.weights as w, j (j)}{' '}{w >= 0 ? '+' : '−'} {formatNumber(Math.abs(w))}·z{j + 1}{/each})</div>
        {:else}
          <span class="text-muted-foreground">{localeStore.t('ensemble.pending')}</span>
        {/if}
        {#if state.probability !== null}
          <div class="mt-1">{localeStore.t('ensemble.probability')} = <span class="font-semibold">{formatNumber(state.probability, 3)}</span></div>
        {/if}
      </div>
    {/if}

    {#if state.prediction !== null}
      <div class="mt-1 rounded-md border-2 border-node-path p-2 text-center">
        <div class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {localeStore.t('ensemble.prediction')}
        </div>
        <div class="font-mono text-lg font-bold">{formatLabel(state.prediction)}</div>
      </div>
    {/if}
  </aside>
</div>

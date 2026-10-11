<script lang="ts">
  import { Info, Star } from '@lucide/svelte'

  import {
    budgetOptions,
    catalog,
    formatRupiah,
    formFactorOptions,
    priorities,
    ramOptions,
  } from '@/lib/algorithms/dss'
  import type { DSSState, FormFactor, Preferences, Priority, Product } from '@/lib/algorithms/dss'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  interface Props {
    state: DSSState
    onPreferencesChange: (preferences: Preferences) => void
  }

  let { state, onPreferencesChange }: Props = $props()

  // Once ranked, list candidates by rank (the DSS's output); before that,
  // keep catalog order so rows don't jump around while filtering.
  const products = $derived.by((): Product[] => {
    if (!state.ranked) return catalog
    const rankOf = (p: Product) => state.status[p.id].rank ?? Infinity
    return [...catalog].sort((a, b) => rankOf(a) - rankOf(b))
  })

  const selectClass =
    'rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring'

  function update(event: Event, patch: Partial<Preferences>): void {
    // Hand focus back to the page so PageUp/PageDown keep stepping.
    ;(event.currentTarget as HTMLSelectElement).blur()
    onPreferencesChange({ ...state.preferences, ...patch })
  }

  function parseNullableNumber(value: string): number | null {
    return value === '' ? null : Number(value)
  }
</script>

<div class="flex h-full flex-col gap-3 overflow-y-auto p-4 scrollbar-thin [&>*]:shrink-0">
  <h2 class="text-lg font-semibold tracking-tight">{localeStore.t('dss.title')}</h2>

  <div class="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3">
    <label class="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      {localeStore.t('dss.pref.budget')}
      <select
        class={selectClass}
        value={state.preferences.maxBudget ?? ''}
        onchange={(e) => update(e, { maxBudget: parseNullableNumber(e.currentTarget.value) })}
      >
        {#each budgetOptions as option (option)}
          <option value={option ?? ''}>
            {option === null ? localeStore.t('dss.any') : `≤ ${formatRupiah(option)}`}
          </option>
        {/each}
      </select>
    </label>
    <label class="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      {localeStore.t('dss.pref.ram')}
      <select
        class={selectClass}
        value={state.preferences.minRam ?? ''}
        onchange={(e) => update(e, { minRam: parseNullableNumber(e.currentTarget.value) })}
      >
        {#each ramOptions as option (option)}
          <option value={option ?? ''}>
            {option === null ? localeStore.t('dss.any') : `≥ ${option} GB`}
          </option>
        {/each}
      </select>
    </label>
    <label class="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      {localeStore.t('dss.pref.formFactor')}
      <select
        class={selectClass}
        value={state.preferences.formFactor ?? ''}
        onchange={(e) =>
          update(e, { formFactor: (e.currentTarget.value || null) as FormFactor | null })}
      >
        {#each formFactorOptions as option (option)}
          <option value={option ?? ''}>
            {option === null ? localeStore.t('dss.any') : localeStore.t(`dss.formFactor.${option}`)}
          </option>
        {/each}
      </select>
    </label>
    <label class="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      {localeStore.t('dss.pref.priority')}
      <select
        class={selectClass}
        value={state.preferences.priority}
        onchange={(e) => update(e, { priority: e.currentTarget.value as Priority })}
      >
        {#each priorities as option (option)}
          <option value={option}>{localeStore.t(`dss.priority.${option}`)}</option>
        {/each}
      </select>
    </label>
  </div>

  <p class="flex items-start gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
    <Info class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
    {localeStore.t('dss.instructions')}
  </p>

  <ul class="flex flex-col gap-2">
    {#each products as product (product.id)}
      {@const status = state.status[product.id]}
      {@const eliminated = status.eliminatedBy !== null}
      {@const justEliminated = eliminated && status.eliminatedBy === state.activeConstraint}
      {@const isCurrent = state.currentProductId === product.id}
      {@const isTop = state.done && status.rank === 1}
      <li
        class={cn(
          'flex items-center gap-4 rounded-lg border bg-card px-4 py-2.5 transition-opacity',
          isCurrent && 'border-node-current ring-2 ring-node-current',
          isTop && 'border-node-path ring-2 ring-node-path',
          justEliminated && 'border-destructive',
          !isCurrent && !isTop && !justEliminated && 'border-border',
          eliminated && !justEliminated && 'opacity-45',
        )}
      >
        <div class="w-8 shrink-0 text-center font-mono text-lg font-bold tabular-nums text-muted-foreground">
          {status.rank !== null ? `#${status.rank}` : ''}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class={cn('font-semibold', eliminated && 'line-through')}>{product.name}</span>
            <span class="rounded border border-border px-1.5 text-[11px] text-muted-foreground">
              {localeStore.t(`dss.formFactor.${product.formFactor}`)}
            </span>
          </div>
          <div class="mt-0.5 text-xs text-muted-foreground">
            {product.cpu} · RAM {product.ramGB} GB ·
            {#if product.rating !== null}
              <Star class="inline size-3 -translate-y-px fill-current" /> {product.rating.toFixed(1)}
            {:else}
              {localeStore.t('dss.noRating')}
            {/if}
          </div>
        </div>
        <div class="w-32 shrink-0 text-right font-mono text-sm font-semibold">{formatRupiah(product.price)}</div>
        <div class="flex w-44 shrink-0 justify-end whitespace-nowrap">
          {#if eliminated}
            <span class="rounded bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">
              {localeStore.t(`dss.reason.${status.eliminatedBy}`)}
            </span>
          {:else if isTop}
            <span class="rounded bg-node-path px-2 py-0.5 text-xs font-semibold text-node-path-foreground">
              {localeStore.t('dss.recommended')} · {status.score?.toFixed(3)}
            </span>
          {:else if status.score !== null}
            <span class="font-mono text-sm">
              <span class="text-xs text-muted-foreground">{localeStore.t('dss.scoreLabel')}</span>
              {status.score.toFixed(3)}
            </span>
          {/if}
        </div>
      </li>
    {/each}
  </ul>

  {#if state.done}
    <p class="rounded-md border border-dashed border-border px-3 py-2 text-sm font-medium">
      {localeStore.t('dss.finalDecision')}
    </p>
  {/if}
</div>

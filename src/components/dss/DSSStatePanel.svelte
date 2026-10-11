<script lang="ts">
  import { Separator } from '@/components/ui/separator'
  import { catalog, criteria, formatRupiah } from '@/lib/algorithms/dss'
  import type { Criterion, DSSState } from '@/lib/algorithms/dss'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { msg } from '@/lib/i18n/translate'

  interface Props {
    state: DSSState
  }

  let { state }: Props = $props()

  const candidateCount = $derived(catalog.filter((p) => state.status[p.id].eliminatedBy === null).length)

  const ranking = $derived(
    catalog
      .filter((p) => state.status[p.id].rank !== null)
      .sort((a, b) => (state.status[a.id].rank ?? 0) - (state.status[b.id].rank ?? 0)),
  )

  function formatReference(criterion: Criterion, value: number): string {
    switch (criterion) {
      case 'price':
        return formatRupiah(value)
      case 'cpu':
        return `tier ${value}`
      case 'ram':
        return `${value} GB`
      case 'rating':
        return value.toFixed(1)
    }
  }
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t(msg('dss.candidatesLabel', { count: candidateCount, total: catalog.length }))}
    </h3>
    <div class="h-2 overflow-hidden rounded-full bg-muted">
      <div
        class="h-full bg-primary transition-[width] duration-300"
        style={`width: ${(candidateCount / catalog.length) * 100}%`}
      ></div>
    </div>
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('dss.weightsLabel')}
    </h3>
    <table class="w-full text-xs">
      <tbody>
        {#each criteria as criterion (criterion)}
          <tr class="border-t border-border first:border-t-0">
            <td class="py-1">
              <div class="font-medium">{localeStore.t(`dss.criterion.${criterion}`)}</div>
              <div class="text-[11px] text-muted-foreground">
                {localeStore.t(criterion === 'price' ? 'dss.cost' : 'dss.benefit')}
              </div>
            </td>
            <td class="py-1 text-right font-mono font-semibold">{state.weights[criterion]}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  {#if state.reference}
    {@const reference = state.reference}
    <Separator />
    <section>
      <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {localeStore.t('dss.referenceLabel')}
      </h3>
      <ul class="space-y-1 text-xs">
        {#each criteria as criterion (criterion)}
          <li class="flex justify-between">
            <span class="text-muted-foreground">{localeStore.t(`dss.criterion.${criterion}`)}</span>
            <span class="font-mono">{formatReference(criterion, reference[criterion])}</span>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('dss.rankingLabel')}
    </h3>
    {#if ranking.length > 0}
      <ol class="space-y-1 text-xs">
        {#each ranking as product (product.id)}
          <li class="flex justify-between gap-2">
            <span><span class="font-mono font-semibold">#{state.status[product.id].rank}</span> {product.name}</span>
            <span class="font-mono">{state.status[product.id].score?.toFixed(3)}</span>
          </li>
        {/each}
      </ol>
    {:else}
      <span class="text-sm text-muted-foreground">{localeStore.t('common.noneYet')}</span>
    {/if}
  </section>

  <Separator />

  <p class="text-xs text-muted-foreground">{localeStore.t('dss.role')}</p>
</div>

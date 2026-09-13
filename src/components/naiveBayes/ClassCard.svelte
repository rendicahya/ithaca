<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import type { ClassResult } from '@/lib/algorithms/naiveBayes/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  interface Props {
    result: ClassResult
    isCurrent: boolean
    currentFeatureIndex: number | null
    isWinner: boolean
  }

  let { result, isCurrent, currentFeatureIndex, isWinner }: Props = $props()
</script>

<div
  class={cn(
    'flex-1 min-w-[220px] rounded-lg border bg-card p-3',
    isCurrent && !isWinner && 'border-node-current ring-2 ring-node-current',
    isWinner && 'border-node-path ring-2 ring-node-path',
    !isCurrent && !isWinner && 'border-border',
  )}
>
  <div class="mb-2 flex items-center justify-between">
    <span class="font-mono text-sm font-semibold">{result.className}</span>
    {#if isWinner}
      <Badge variant="default" class="bg-node-path text-node-path-foreground">
        {localeStore.t('naiveBayes.winnerLabel')}
      </Badge>
    {/if}
  </div>

  <div class="mb-2 text-xs">
    <span class="text-muted-foreground">{localeStore.t('naiveBayes.priorLabel')}: </span>
    <span class="font-mono font-medium">
      {result.classCount}/{result.totalCount} = {result.prior.toFixed(3)}
    </span>
  </div>

  <Separator class="mb-2" />

  <div class="mb-2 flex flex-col gap-1">
    <span class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('naiveBayes.likelihoodLabel')}
    </span>
    {#each result.likelihoods as l, i (l.feature)}
      <div
        class={cn(
          'flex items-center justify-between rounded px-1.5 py-0.5 text-xs',
          isCurrent && currentFeatureIndex === i && 'bg-node-current/20',
        )}
      >
        <span class="font-mono text-muted-foreground">{l.feature}={l.value}</span>
        <span class="font-mono">
          {l.matchingCount}/{l.classCount} = {l.probability.toFixed(3)}
        </span>
      </div>
    {/each}
    {#if result.likelihoods.length === 0}
      <span class="text-xs text-muted-foreground">{localeStore.t('common.noneYet')}</span>
    {/if}
  </div>

  {#if result.posteriorComputed}
    <Separator class="mb-2" />
    <div class="text-xs">
      <span class="text-muted-foreground">{localeStore.t('naiveBayes.posteriorLabel')}: </span>
      <span class="font-mono font-semibold">{result.posterior.toFixed(5)}</span>
    </div>
    {#if result.normalized !== null}
      <div class="mt-1 text-xs">
        <span class="text-muted-foreground">{localeStore.t('naiveBayes.posteriorNormalizedLabel')}: </span>
        <span class="font-mono font-semibold">{(result.normalized * 100).toFixed(1)}%</span>
      </div>
    {/if}
  {/if}
</div>

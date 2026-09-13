<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import type { NBState } from '@/lib/algorithms/naiveBayes/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'

  import ClassCard from './ClassCard.svelte'

  interface Props {
    state: NBState
  }

  let { state }: Props = $props()
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <div>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('naiveBayes.queryLabel')}
    </h3>
    <div class="flex flex-wrap gap-1.5">
      {#each state.query as q (q.feature)}
        <Badge variant="outline" class="font-mono">{q.feature} = {q.value}</Badge>
      {/each}
    </div>
  </div>

  <div class="flex flex-1 flex-wrap items-start gap-3">
    {#each state.classNames as className (className)}
      <ClassCard
        result={state.results[className]}
        isCurrent={state.currentClass === className}
        currentFeatureIndex={state.currentClass === className ? state.currentFeatureIndex : null}
        isWinner={state.done && state.predictedClass === className}
      />
    {/each}
  </div>
</div>

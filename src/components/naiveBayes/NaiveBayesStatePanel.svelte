<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import type { NBExample } from '@/lib/algorithms/naiveBayes/dataset'
  import type { NBState } from '@/lib/algorithms/naiveBayes/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'

  interface Props {
    state: NBState
    dataset: NBExample[]
  }

  let { state, dataset }: Props = $props()
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('naiveBayes.datasetLabel')} ({dataset.length})
    </h3>
    <div class="max-h-48 overflow-y-auto rounded-md border border-border scrollbar-thin">
      <table class="w-full font-mono text-[11px]">
        <thead class="sticky top-0 bg-card">
          <tr class="text-muted-foreground">
            <th class="p-1 text-left">Outlook</th>
            <th class="p-1 text-left">Temp</th>
            <th class="p-1 text-left">Humidity</th>
            <th class="p-1 text-left">Wind</th>
            <th class="p-1 text-left">Play</th>
          </tr>
        </thead>
        <tbody>
          {#each dataset as row, i (i)}
            <tr class="border-t border-border">
              <td class="p-1">{row.outlook}</td>
              <td class="p-1">{row.temperature}</td>
              <td class="p-1">{row.humidity}</td>
              <td class="p-1">{row.wind}</td>
              <td class="p-1 font-semibold">{row.play}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('naiveBayes.classesLabel')}
    </h3>
    <div class="flex gap-1.5">
      {#each state.classNames as c (c)}
        <Badge variant={state.currentClass === c ? 'default' : 'muted'} class="font-mono">
          {c}
        </Badge>
      {/each}
    </div>
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('naiveBayes.predictionLabel')}
    </h3>
    {#if state.predictedClass}
      <p class="font-mono text-sm font-semibold text-node-path">{state.predictedClass}</p>
    {:else}
      <span class="text-sm text-muted-foreground">{localeStore.t('common.noneYet')}</span>
    {/if}
  </section>
</div>

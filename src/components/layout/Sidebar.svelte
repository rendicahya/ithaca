<script lang="ts">
  import type { SearchAlgorithm } from '@/lib/algorithms/search/types'
  import type { GraphExample } from '@/lib/graph/examples'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  interface Props {
    algorithms: SearchAlgorithm[]
    selectedId: SearchAlgorithm['id']
    onSelect: (id: SearchAlgorithm['id']) => void
    graphExamples: GraphExample[]
    selectedGraphId: GraphExample['id']
    onSelectGraph: (id: GraphExample['id']) => void
  }

  let { algorithms, selectedId, onSelect, graphExamples, selectedGraphId, onSelectGraph }: Props =
    $props()

  const upcomingTopicKeys = [
    'topics.genetic',
    'topics.propositional',
    'topics.firstOrder',
    'topics.prolog',
    'topics.knn',
    'topics.naiveBayes',
  ]
</script>

<nav class="flex h-full flex-col gap-6 overflow-y-auto p-3 scrollbar-thin">
  <div>
    <h2 class="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('sidebar.graphExample')}
    </h2>
    <ul class="space-y-0.5">
      {#each graphExamples as example (example.id)}
        <li>
          <button
            type="button"
            class={cn(
              'w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors',
              selectedGraphId === example.id
                ? 'bg-secondary font-medium text-secondary-foreground'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            aria-current={selectedGraphId === example.id ? 'page' : undefined}
            onclick={() => onSelectGraph(example.id)}
          >
            {localeStore.t(`graphs.${example.id}.name`)}
          </button>
        </li>
      {/each}
    </ul>
  </div>

  <div>
    <h2 class="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('sidebar.searchAlgorithms')}
    </h2>
    <ul class="space-y-0.5">
      {#each algorithms as algorithm (algorithm.id)}
        <li>
          <button
            type="button"
            class={cn(
              'w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors',
              selectedId === algorithm.id
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            aria-current={selectedId === algorithm.id ? 'page' : undefined}
            onclick={() => onSelect(algorithm.id)}
          >
            {localeStore.t(`algorithms.${algorithm.id}.name`)}
          </button>
        </li>
      {/each}
    </ul>
  </div>

  <div>
    <h2 class="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('sidebar.comingSoon')}
    </h2>
    <ul class="space-y-0.5">
      {#each upcomingTopicKeys as key (key)}
        <li>
          <span
            class="block cursor-not-allowed rounded-md px-2.5 py-2 text-sm text-muted-foreground/60"
          >
            {localeStore.t(key)}
          </span>
        </li>
      {/each}
    </ul>
  </div>
</nav>

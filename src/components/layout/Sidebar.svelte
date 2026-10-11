<script lang="ts">
  import {
    BrainCircuit,
    Bot,
    Boxes,
    ClipboardCheck,
    Dna,
    Route,
    Tags,
    TrendingUp,
  } from '@lucide/svelte'

  import { flowIds } from '@/lib/algorithms/esArchitecture'
  import type { FlowId } from '@/lib/algorithms/esArchitecture'
  import type { PatientId } from '@/lib/algorithms/expertSystem'
  import { patientProfiles } from '@/lib/algorithms/expertSystem'
  import type { GAExample, GAExampleId } from '@/lib/algorithms/genetic'
  import type { SearchAlgorithm } from '@/lib/algorithms/search/types'
  import type { GraphExample } from '@/lib/graph/examples'
  import type { Graph, NodeId } from '@/lib/graph/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { topicCategories, topicLabelKey } from '@/lib/topics'
  import type { CategoryId, Topic } from '@/lib/topics'
  import { cn } from '@/lib/utils'

  interface Props {
    selectedTopic: Topic
    onSelectTopic: (topic: Topic) => void
    algorithms: SearchAlgorithm[]
    selectedId: SearchAlgorithm['id']
    onSelect: (id: SearchAlgorithm['id']) => void
    graphExamples: GraphExample[]
    selectedGraphId: GraphExample['id']
    onSelectGraph: (id: GraphExample['id']) => void
    graph: Graph
    onSelectGoal: (id: NodeId) => void
    gaExamples: GAExample[]
    selectedGAExampleId: GAExampleId
    onSelectGAExample: (id: GAExampleId) => void
    /** null when the lecturer has edited the answers away from every preset. */
    selectedPatientId: PatientId | null
    onSelectPatient: (id: PatientId) => void
    selectedArchFlow: FlowId
    onSelectArchFlow: (id: FlowId) => void
  }

  let {
    selectedTopic,
    onSelectTopic,
    algorithms,
    selectedId,
    onSelect,
    graphExamples,
    selectedGraphId,
    onSelectGraph,
    graph,
    onSelectGoal,
    gaExamples,
    selectedGAExampleId,
    onSelectGAExample,
    selectedPatientId,
    onSelectPatient,
    selectedArchFlow,
    onSelectArchFlow,
  }: Props = $props()

  const topicsWithOptions: Topic[] = ['search', 'genetic', 'esArchitecture', 'expertSystem']

  const categoryIcons: Record<CategoryId, typeof Route> = {
    search: Route,
    population: Dna,
    logic: BrainCircuit,
    expert: ClipboardCheck,
    classification: Tags,
    regression: TrendingUp,
    clustering: Boxes,
    reinforcement: Bot,
  }

  let navElement: HTMLElement | undefined

  // Topics low in the list (e.g. a remembered Q-Learning session) would
  // otherwise open scrolled out of sight; keep the active one visible.
  $effect(() => {
    void selectedTopic
    // Scroll the whole list item so the topic's nested options are visible too.
    navElement?.querySelector('[aria-current="page"]')?.closest('li')?.scrollIntoView({ block: 'nearest' })
  })

  const optionButtonClass =(selected: boolean) =>
    cn(
      'w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
      selected
        ? 'bg-secondary font-medium text-secondary-foreground'
        : 'text-foreground hover:bg-accent hover:text-accent-foreground',
    )
</script>

{#snippet optionGroupHeading(labelKey: string)}
  <h3 class="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
    {localeStore.t(labelKey)}
  </h3>
{/snippet}

{#snippet topicOptions(topic: Topic)}
  {#if topic === 'search'}
    <div>
      {@render optionGroupHeading('sidebar.graphExample')}
      <ul class="space-y-0.5">
        {#each graphExamples as example (example.id)}
          <li>
            <button
              type="button"
              class={optionButtonClass(selectedGraphId === example.id)}
              aria-current={selectedGraphId === example.id ? 'true' : undefined}
              onclick={() => onSelectGraph(example.id)}
            >
              {localeStore.t(`graphs.${example.id}.name`)}
            </button>
          </li>
        {/each}
      </ul>
    </div>

    {#if selectedGraphId !== 'custom'}
      <div>
        {@render optionGroupHeading('sidebar.goalNode')}
        <select
          value={graph.goal}
          onchange={(e) => onSelectGoal(e.currentTarget.value)}
          class="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground"
        >
          {#each graph.nodes as node (node.id)}
            <option value={node.id}>{node.label}</option>
          {/each}
        </select>
      </div>
    {/if}

    <div>
      {@render optionGroupHeading('sidebar.algorithms')}
      <ul class="space-y-0.5">
        {#each algorithms as algorithm (algorithm.id)}
          <li>
            <button
              type="button"
              class={optionButtonClass(selectedId === algorithm.id)}
              aria-current={selectedId === algorithm.id ? 'true' : undefined}
              onclick={() => onSelect(algorithm.id)}
            >
              {localeStore.t(`algorithms.${algorithm.id}.name`)}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {:else if topic === 'genetic'}
    <div>
      {@render optionGroupHeading('sidebar.gaExample')}
      <ul class="space-y-0.5">
        {#each gaExamples as example (example.id)}
          <li>
            <button
              type="button"
              class={optionButtonClass(selectedGAExampleId === example.id)}
              aria-current={selectedGAExampleId === example.id ? 'true' : undefined}
              onclick={() => onSelectGAExample(example.id)}
            >
              {localeStore.t(example.nameKey)}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {:else if topic === 'esArchitecture'}
    <div>
      {@render optionGroupHeading('sidebar.flow')}
      <ol class="space-y-0.5">
        {#each flowIds as flow, i (flow)}
          <li>
            <button
              type="button"
              class={optionButtonClass(selectedArchFlow === flow)}
              aria-current={selectedArchFlow === flow ? 'true' : undefined}
              onclick={() => onSelectArchFlow(flow)}
            >
              <span class="font-mono text-xs text-muted-foreground">{i + 1}.</span>
              {localeStore.t(`esArch.flow.${flow}`)}
            </button>
          </li>
        {/each}
      </ol>
    </div>
  {:else if topic === 'expertSystem'}
    <div>
      {@render optionGroupHeading('sidebar.patient')}
      <ul class="space-y-0.5">
        {#each patientProfiles as patient (patient.id)}
          <li>
            <button
              type="button"
              class={optionButtonClass(selectedPatientId === patient.id)}
              aria-current={selectedPatientId === patient.id ? 'true' : undefined}
              onclick={() => onSelectPatient(patient.id)}
            >
              {localeStore.t(`expertSystem.patient.${patient.id}`)}
              <span class="block text-xs font-normal text-muted-foreground">
                {localeStore.t(`expertSystem.patient.${patient.id}.hint`)}
              </span>
            </button>
          </li>
        {/each}
        {#if selectedPatientId === null}
          <li class="rounded-md bg-secondary px-2.5 py-1.5 text-sm font-medium text-secondary-foreground">
            {localeStore.t('expertSystem.patient.custom')}
          </li>
        {/if}
      </ul>
    </div>
  {/if}
{/snippet}

<nav bind:this={navElement} class="flex h-full flex-col gap-4 overflow-y-auto p-3 scrollbar-thin">
  {#each topicCategories as category (category.id)}
    {@const Icon = categoryIcons[category.id]}
    <section>
      <h2
        class="mb-1 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
      >
        <Icon class="size-3.5 shrink-0" aria-hidden="true" />
        {localeStore.t(category.labelKey)}
      </h2>
      <ul class="space-y-0.5">
        {#each category.topics as topic (topic)}
          {@const selected = selectedTopic === topic}
          <li>
            <button
              type="button"
              class={cn(
                'w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                selected
                  ? 'bg-primary font-medium text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground',
              )}
              aria-current={selected ? 'page' : undefined}
              onclick={() => onSelectTopic(topic)}
            >
              {localeStore.t(topicLabelKey(topic))}
            </button>
            {#if selected && topicsWithOptions.includes(topic)}
              <div class="mb-1 ml-3 mt-1.5 flex flex-col gap-3 border-l-2 border-primary/40 pl-2">
                {@render topicOptions(topic)}
              </div>
            {/if}
          </li>
        {/each}
        {#each category.upcomingKeys ?? [] as key (key)}
          <li
            class="flex cursor-not-allowed items-center justify-between rounded-md px-2.5 py-2 text-sm text-muted-foreground/60"
          >
            {localeStore.t(key)}
            <span class="rounded border border-border px-1 text-[10px] uppercase">
              {localeStore.t('sidebar.soon')}
            </span>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</nav>

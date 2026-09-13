<script lang="ts">
  import { onMount } from 'svelte'

  import AppShell from '@/components/layout/AppShell.svelte'
  import Header from '@/components/layout/Header.svelte'
  import Sidebar from '@/components/layout/Sidebar.svelte'
  import type { Topic } from '@/components/layout/Sidebar.svelte'
  import PrologStatePanel from '@/components/prolog/PrologStatePanel.svelte'
  import ProofTreeView from '@/components/prolog/ProofTreeView.svelte'
  import PseudocodePanel from '@/components/pseudocode/PseudocodePanel.svelte'
  import StatePanel from '@/components/state/StatePanel.svelte'
  import DecisionTrace from '@/components/trace/DecisionTrace.svelte'
  import StepExplanation from '@/components/trace/StepExplanation.svelte'
  import ExecutionControls from '@/components/execution/ExecutionControls.svelte'
  import KeyboardShortcutHelp from '@/components/execution/KeyboardShortcutHelp.svelte'
  import GraphView from '@/components/visualization/GraphView.svelte'
  import { getAlgorithm, searchAlgorithms } from '@/lib/algorithms/search'
  import type { SearchAlgorithm, SearchStep } from '@/lib/algorithms/search/types'
  import { ExecutionController } from '@/lib/execution/controller.svelte'
  import { fullscreenStore } from '@/lib/fullscreen.svelte'
  import { getGraphExample, graphExamples } from '@/lib/graph/examples'
  import type { GraphExample } from '@/lib/graph/examples'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import type { Message } from '@/lib/i18n/translate'
  import { defaultDatabase, defaultQuery, prologPseudocode, solveProlog } from '@/lib/prolog'
  import type { ProofStep } from '@/lib/prolog'
  import { registerGlobalShortcuts } from '@/lib/shortcuts/shortcuts'

  let selectedTopic = $state<Topic>('search')

  // --- Search Algorithms ---
  let selectedAlgorithmId = $state<SearchAlgorithm['id']>('bfs')
  const algorithm = $derived(getAlgorithm(selectedAlgorithmId))

  let selectedGraphId = $state<GraphExample['id']>('weighted')
  const graph = $derived(getGraphExample(selectedGraphId).graph)

  const searchController = new ExecutionController<SearchStep>()

  $effect(() => {
    searchController.load(algorithm.run(graph))
  })

  // --- Prolog ---
  const prologController = new ExecutionController<ProofStep>()

  $effect(() => {
    prologController.load(solveProlog(defaultDatabase, defaultQuery))
  })

  const controller = $derived(selectedTopic === 'search' ? searchController : prologController)

  let helpOpen = $state(false)
  let pseudocodeVisible = $state(true)

  const traceEntries = $derived(
    controller.steps
      .slice(0, controller.currentIndex + 1)
      .map((s) => s.traceEntry)
      .filter((entry): entry is Message => Boolean(entry)),
  )

  const pseudocodeLines = $derived(
    selectedTopic === 'search' ? algorithm.pseudocode : prologPseudocode,
  )
  const pseudocodeTitle = $derived(
    selectedTopic === 'search'
      ? localeStore.t(`algorithms.${algorithm.id}.name`)
      : localeStore.t('topics.prolog'),
  )

  onMount(() => {
    return registerGlobalShortcuts({
      stepForward: () => controller.stepForward(),
      stepBackward: () => controller.stepBackward(),
      toggleRun: () => controller.toggleRun(),
      reset: () => controller.reset(),
      toggleHelp: () => (helpOpen = !helpOpen),
      closeOrExitFullscreen: () => {
        if (helpOpen) helpOpen = false
        else fullscreenStore.exit()
      },
    })
  })
</script>

<AppShell {pseudocodeVisible}>
  {#snippet header()}
    <Header />
  {/snippet}

  {#snippet nav()}
    <Sidebar
      {selectedTopic}
      onSelectTopic={(topic) => (selectedTopic = topic)}
      algorithms={searchAlgorithms}
      selectedId={selectedAlgorithmId}
      onSelect={(id) => (selectedAlgorithmId = id)}
      {graphExamples}
      selectedGraphId={selectedGraphId}
      onSelectGraph={(id) => (selectedGraphId = id)}
    />
  {/snippet}

  {#snippet explanation()}
    {#if controller.current}
      <StepExplanation
        message={controller.current.explanation}
        current={controller.progress.current}
        total={controller.progress.total}
      />
    {/if}
  {/snippet}

  {#snippet main()}
    {#if selectedTopic === 'search'}
      {#if searchController.current}
        <GraphView
          {graph}
          state={searchController.current.state}
          frontierKind={algorithm.frontierKind}
        />
      {/if}
    {:else if prologController.current}
      <ProofTreeView state={prologController.current.state} />
    {/if}
  {/snippet}

  {#snippet panel()}
    <div class="flex h-full flex-col">
      <div class="flex-1 overflow-hidden">
        {#if selectedTopic === 'search'}
          {#if searchController.current}
            <StatePanel state={searchController.current.state} {algorithm} />
          {/if}
        {:else if prologController.current}
          <PrologStatePanel
            state={prologController.current.state}
            database={defaultDatabase}
            query={defaultQuery}
          />
        {/if}
      </div>
      <div class="h-48 border-t border-border">
        <DecisionTrace entries={traceEntries} />
      </div>
    </div>
  {/snippet}

  {#snippet pseudocode()}
    <PseudocodePanel
      lines={pseudocodeLines}
      activeLine={controller.current?.activePseudocodeLine ?? 0}
      title={pseudocodeTitle}
      visible={pseudocodeVisible}
      onToggleVisible={() => (pseudocodeVisible = !pseudocodeVisible)}
    />
  {/snippet}

  {#snippet controls()}
    <ExecutionControls {controller} onShowHelp={() => (helpOpen = true)} />
  {/snippet}
</AppShell>

<KeyboardShortcutHelp bind:open={helpOpen} />

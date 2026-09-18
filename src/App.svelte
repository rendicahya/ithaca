<script lang="ts">
  import { onMount } from 'svelte'
  import { Pencil } from '@lucide/svelte'

  import AppShell from '@/components/layout/AppShell.svelte'
  import { Button } from '@/components/ui/button'
  import Header from '@/components/layout/Header.svelte'
  import Sidebar from '@/components/layout/Sidebar.svelte'
  import type { Topic } from '@/components/layout/Sidebar.svelte'
  import GeneticStatePanel from '@/components/genetic/GeneticStatePanel.svelte'
  import PopulationView from '@/components/genetic/PopulationView.svelte'
  import ACOGraphView from '@/components/aco/ACOGraphView.svelte'
  import ACOStatePanel from '@/components/aco/ACOStatePanel.svelte'
  import ParticleSwarmView from '@/components/pso/ParticleSwarmView.svelte'
  import PSOStatePanel from '@/components/pso/PSOStatePanel.svelte'
  import NaiveBayesStatePanel from '@/components/naiveBayes/NaiveBayesStatePanel.svelte'
  import NaiveBayesView from '@/components/naiveBayes/NaiveBayesView.svelte'
  import PrologStatePanel from '@/components/prolog/PrologStatePanel.svelte'
  import ProofTreeView from '@/components/prolog/ProofTreeView.svelte'
  import PseudocodePanel from '@/components/pseudocode/PseudocodePanel.svelte'
  import StatePanel from '@/components/state/StatePanel.svelte'
  import DecisionTrace from '@/components/trace/DecisionTrace.svelte'
  import StepExplanation from '@/components/trace/StepExplanation.svelte'
  import ExecutionControls from '@/components/execution/ExecutionControls.svelte'
  import KeyboardShortcutHelp from '@/components/execution/KeyboardShortcutHelp.svelte'
  import GraphEditorPanel from '@/components/visualization/GraphEditorPanel.svelte'
  import GraphEditorView from '@/components/visualization/GraphEditorView.svelte'
  import GraphView from '@/components/visualization/GraphView.svelte'
  import { getAlgorithm, searchAlgorithms } from '@/lib/algorithms/search'
  import type { SearchAlgorithm, SearchStep } from '@/lib/algorithms/search/types'
  import { geneticPseudocode, runGeneticAlgorithm } from '@/lib/algorithms/genetic'
  import type { GAStep } from '@/lib/algorithms/genetic'
  import { acoPseudocode, runACO } from '@/lib/algorithms/aco'
  import type { ACOStep } from '@/lib/algorithms/aco'
  import { psoPseudocode, runPSO } from '@/lib/algorithms/pso'
  import type { PSOStep } from '@/lib/algorithms/pso'
  import { naiveBayesPseudocode, playTennisDataset, runNaiveBayes } from '@/lib/algorithms/naiveBayes'
  import type { NBStep } from '@/lib/algorithms/naiveBayes'
  import { ExecutionController } from '@/lib/execution/controller.svelte'
  import { fullscreenStore } from '@/lib/fullscreen.svelte'
  import { customGraphStore } from '@/lib/graph/customGraph.svelte'
  import { getGraphExample, graphExamples } from '@/lib/graph/examples'
  import type { GraphExample } from '@/lib/graph/examples'
  import { computeHeuristics } from '@/lib/graph/heuristics'
  import { isValidGraph } from '@/lib/graph/types'
  import type { NodeId } from '@/lib/graph/types'
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

  // Per-example goal override, chosen by the lecturer from the sidebar.
  // Heuristics are recomputed for the new goal (rather than reused as-is)
  // because the hand-tuned h(n) values in defaultGraph/treeGraph are only
  // valid for their original goal — some are deliberately loose to make
  // Greedy's flaw visible there, and would silently be wrong elsewhere.
  let goalOverrides = $state<Record<string, NodeId>>({})

  const graph = $derived.by(() => {
    if (selectedGraphId === 'custom') return customGraphStore.graph
    const base = getGraphExample(selectedGraphId).graph
    const goalId = goalOverrides[selectedGraphId]
    if (!goalId || goalId === base.goal) return base
    const heuristics = computeHeuristics(base, goalId)
    return {
      ...base,
      goal: goalId,
      nodes: base.nodes.map((n) => ({ ...n, heuristic: heuristics[n.id] })),
    }
  })

  function selectGoal(id: NodeId): void {
    goalOverrides = { ...goalOverrides, [selectedGraphId]: id }
  }

  let editingCustomGraph = $state(false)
  const showGraphEditor = $derived(
    selectedTopic === 'search' &&
      selectedGraphId === 'custom' &&
      (editingCustomGraph || customGraphStore.graph.nodes.length === 0),
  )

  const searchController = new ExecutionController<SearchStep>()

  $effect(() => {
    searchController.load(isValidGraph(graph) ? algorithm.run(graph) : [])
  })

  // --- Prolog ---
  const prologController = new ExecutionController<ProofStep>()

  $effect(() => {
    prologController.load(solveProlog(defaultDatabase, defaultQuery))
  })

  // --- Genetic Algorithm ---
  const geneticController = new ExecutionController<GAStep>()

  $effect(() => {
    geneticController.load(runGeneticAlgorithm())
  })

  // --- Particle Swarm Optimization ---
  const psoController = new ExecutionController<PSOStep>()

  $effect(() => {
    psoController.load(runPSO())
  })

  // --- Ant Colony Optimization ---
  const acoController = new ExecutionController<ACOStep>()

  $effect(() => {
    acoController.load(runACO())
  })

  // --- Naïve Bayes ---
  const naiveBayesController = new ExecutionController<NBStep>()

  $effect(() => {
    naiveBayesController.load(runNaiveBayes())
  })

  const controller = $derived(
    selectedTopic === 'search'
      ? searchController
      : selectedTopic === 'prolog'
        ? prologController
        : selectedTopic === 'genetic'
          ? geneticController
          : selectedTopic === 'pso'
            ? psoController
            : selectedTopic === 'aco'
              ? acoController
              : naiveBayesController,
  )

  let helpOpen = $state(false)
  let pseudocodeVisible = $state(true)

  const traceEntries = $derived(
    showGraphEditor
      ? []
      : controller.steps
          .slice(0, controller.currentIndex + 1)
          .map((s) => s.traceEntry)
          .filter((entry): entry is Message => Boolean(entry)),
  )

  const pseudocodeLines = $derived(
    selectedTopic === 'search'
      ? algorithm.pseudocode
      : selectedTopic === 'prolog'
        ? prologPseudocode
        : selectedTopic === 'genetic'
          ? geneticPseudocode
          : selectedTopic === 'pso'
            ? psoPseudocode
            : selectedTopic === 'aco'
              ? acoPseudocode
              : naiveBayesPseudocode,
  )
  const pseudocodeTitle = $derived(
    selectedTopic === 'search'
      ? localeStore.t(`algorithms.${algorithm.id}.name`)
      : selectedTopic === 'prolog'
        ? localeStore.t('topics.prolog')
        : selectedTopic === 'genetic'
          ? localeStore.t('topics.genetic')
          : selectedTopic === 'pso'
            ? localeStore.t('topics.pso')
            : selectedTopic === 'aco'
              ? localeStore.t('topics.aco')
              : localeStore.t('topics.naiveBayes'),
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
      {graph}
      onSelectGoal={selectGoal}
    />
  {/snippet}

  {#snippet explanation()}
    {#if controller.current && !showGraphEditor}
      <StepExplanation
        message={controller.current.explanation}
        current={controller.progress.current}
        total={controller.progress.total}
      />
    {/if}
  {/snippet}

  {#snippet main()}
    {#if selectedTopic === 'search'}
      {#if showGraphEditor}
        <GraphEditorView store={customGraphStore} />
      {:else}
        <div class="relative h-full">
          {#if selectedGraphId === 'custom'}
            <div class="absolute right-2 top-2 z-10">
              <Button
                variant="outline"
                size="sm"
                class="bg-card"
                onclick={() => (editingCustomGraph = true)}
              >
                <Pencil class="size-3.5" />
                {localeStore.t('customGraph.editGraph')}
              </Button>
            </div>
          {/if}
          {#if searchController.current}
            <GraphView
              {graph}
              state={searchController.current.state}
              frontierKind={algorithm.frontierKind}
            />
          {/if}
        </div>
      {/if}
    {:else if selectedTopic === 'prolog'}
      {#if prologController.current}
        <ProofTreeView state={prologController.current.state} />
      {/if}
    {:else if selectedTopic === 'genetic'}
      {#if geneticController.current}
        <PopulationView state={geneticController.current.state} />
      {/if}
    {:else if selectedTopic === 'pso'}
      {#if psoController.current}
        <ParticleSwarmView state={psoController.current.state} />
      {/if}
    {:else if selectedTopic === 'aco'}
      {#if acoController.current}
        <ACOGraphView state={acoController.current.state} />
      {/if}
    {:else if naiveBayesController.current}
      <NaiveBayesView state={naiveBayesController.current.state} />
    {/if}
  {/snippet}

  {#snippet panel()}
    <div class="flex h-full flex-col">
      <div class="flex-1 overflow-hidden">
        {#if selectedTopic === 'search'}
          {#if showGraphEditor}
            <GraphEditorPanel store={customGraphStore} onRun={() => (editingCustomGraph = false)} />
          {:else if searchController.current}
            <StatePanel state={searchController.current.state} {algorithm} />
          {/if}
        {:else if selectedTopic === 'prolog'}
          {#if prologController.current}
            <PrologStatePanel
              state={prologController.current.state}
              database={defaultDatabase}
              query={defaultQuery}
            />
          {/if}
        {:else if selectedTopic === 'genetic'}
          {#if geneticController.current}
            <GeneticStatePanel state={geneticController.current.state} />
          {/if}
        {:else if selectedTopic === 'pso'}
          {#if psoController.current}
            <PSOStatePanel state={psoController.current.state} />
          {/if}
        {:else if selectedTopic === 'aco'}
          {#if acoController.current}
            <ACOStatePanel state={acoController.current.state} />
          {/if}
        {:else if naiveBayesController.current}
          <NaiveBayesStatePanel
            state={naiveBayesController.current.state}
            dataset={playTennisDataset}
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

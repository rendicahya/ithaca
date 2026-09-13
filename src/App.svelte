<script lang="ts">
  import { onMount } from 'svelte'

  import AppShell from '@/components/layout/AppShell.svelte'
  import Header from '@/components/layout/Header.svelte'
  import Sidebar from '@/components/layout/Sidebar.svelte'
  import PseudocodePanel from '@/components/pseudocode/PseudocodePanel.svelte'
  import StatePanel from '@/components/state/StatePanel.svelte'
  import DecisionTrace from '@/components/trace/DecisionTrace.svelte'
  import StepExplanation from '@/components/trace/StepExplanation.svelte'
  import ExecutionControls from '@/components/execution/ExecutionControls.svelte'
  import KeyboardShortcutHelp from '@/components/execution/KeyboardShortcutHelp.svelte'
  import GraphView from '@/components/visualization/GraphView.svelte'
  import { getAlgorithm, searchAlgorithms } from '@/lib/algorithms/search'
  import type { SearchAlgorithm } from '@/lib/algorithms/search/types'
  import { ExecutionController } from '@/lib/execution/controller.svelte'
  import { fullscreenStore } from '@/lib/fullscreen.svelte'
  import { getGraphExample, graphExamples } from '@/lib/graph/examples'
  import type { GraphExample } from '@/lib/graph/examples'
  import { registerGlobalShortcuts } from '@/lib/shortcuts/shortcuts'

  let selectedAlgorithmId = $state<SearchAlgorithm['id']>('bfs')
  const algorithm = $derived(getAlgorithm(selectedAlgorithmId))

  let selectedGraphId = $state<GraphExample['id']>('weighted')
  const graph = $derived(getGraphExample(selectedGraphId).graph)

  const controller = new ExecutionController()

  $effect(() => {
    controller.load(algorithm.run(graph))
  })

  let helpOpen = $state(false)
  let pseudocodeVisible = $state(true)

  const traceEntries = $derived(
    controller.steps
      .slice(0, controller.currentIndex + 1)
      .map((s) => s.traceEntry)
      .filter((entry): entry is string => Boolean(entry)),
  )

  onMount(() => {
    return registerGlobalShortcuts({
      stepForward: controller.stepForward,
      stepBackward: controller.stepBackward,
      toggleRun: controller.toggleRun,
      reset: controller.reset,
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
        text={controller.current.explanation}
        current={controller.progress.current}
        total={controller.progress.total}
      />
    {/if}
  {/snippet}

  {#snippet main()}
    {#if controller.current}
      <GraphView {graph} state={controller.current.state} frontierKind={algorithm.frontierKind} />
    {/if}
  {/snippet}

  {#snippet panel()}
    {#if controller.current}
      <div class="flex h-full flex-col">
        <div class="flex-1 overflow-hidden">
          <StatePanel state={controller.current.state} {algorithm} />
        </div>
        <div class="h-48 border-t border-border">
          <DecisionTrace entries={traceEntries} />
        </div>
      </div>
    {/if}
  {/snippet}

  {#snippet pseudocode()}
    {#if controller.current}
      <PseudocodePanel
        lines={algorithm.pseudocode}
        activeLine={controller.current.activePseudocodeLine}
        title={algorithm.name}
        visible={pseudocodeVisible}
        onToggleVisible={() => (pseudocodeVisible = !pseudocodeVisible)}
      />
    {/if}
  {/snippet}

  {#snippet controls()}
    <ExecutionControls {controller} onShowHelp={() => (helpOpen = true)} />
  {/snippet}
</AppShell>

<KeyboardShortcutHelp bind:open={helpOpen} />

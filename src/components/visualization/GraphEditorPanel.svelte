<script lang="ts">
  import { Trash2 } from '@lucide/svelte'

  import { Badge } from '@/components/ui/badge'
  import { Button } from '@/components/ui/button'
  import { Separator } from '@/components/ui/separator'
  import { defaultGraph } from '@/lib/graph/defaultGraph'
  import { treeGraph } from '@/lib/graph/treeGraph'
  import type { CustomGraphStore } from '@/lib/graph/customGraph.svelte'
  import { isValidGraph } from '@/lib/graph/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'

  interface Props {
    store: CustomGraphStore
    onRun: () => void
  }

  let { store, onRun }: Props = $props()

  let confirmingClear = $state(false)
  let templateChoice = $state('')

  const selectedNode = $derived(
    store.selectedNodeId ? (store.graph.nodes.find((n) => n.id === store.selectedNodeId) ?? null) : null,
  )
  const selectedEdge = $derived(
    store.selectedEdgeId ? (store.graph.edges.find((e) => e.id === store.selectedEdgeId) ?? null) : null,
  )

  function addNode(): void {
    const count = store.graph.nodes.length
    const x = 80 + (count % 4) * 160
    const y = 80 + Math.floor(count / 4) * 140
    store.addNode(x, y)
  }

  function applyTemplate(): void {
    if (templateChoice === 'weighted') store.loadTemplate(defaultGraph)
    else if (templateChoice === 'tree') store.loadTemplate(treeGraph)
    templateChoice = ''
  }

  function confirmClear(): void {
    store.clear()
    confirmingClear = false
  }
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('customGraph.title')}
    </h3>
    <p class="text-xs text-muted-foreground">{localeStore.t('customGraph.instructions')}</p>
  </section>

  <Separator />

  {#if store.graph.nodes.length === 0}
    <section class="flex flex-col gap-2">
      <h3 class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {localeStore.t('customGraph.loadTemplate')}
      </h3>
      <select
        bind:value={templateChoice}
        onchange={applyTemplate}
        class="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
      >
        <option value="" disabled>{localeStore.t('customGraph.loadTemplatePlaceholder')}</option>
        <option value="weighted">{localeStore.t('graphs.weighted.name')}</option>
        <option value="tree">{localeStore.t('graphs.tree.name')}</option>
      </select>
      <Button variant="default" size="sm" onclick={addNode}>
        {localeStore.t('customGraph.addNode')}
      </Button>
    </section>
  {:else}
    <section class="flex flex-col gap-2">
      <Button variant="default" size="sm" onclick={addNode}>
        {localeStore.t('customGraph.addNode')}
      </Button>
      {#if confirmingClear}
        <div class="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2">
          <span class="flex-1 text-xs">{localeStore.t('customGraph.confirmClear')}</span>
          <Button variant="destructive" size="sm" onclick={confirmClear}>
            {localeStore.t('customGraph.confirmYes')}
          </Button>
          <Button variant="ghost" size="sm" onclick={() => (confirmingClear = false)}>
            {localeStore.t('customGraph.confirmCancel')}
          </Button>
        </div>
      {:else}
        <Button variant="outline" size="sm" onclick={() => (confirmingClear = true)}>
          {localeStore.t('customGraph.clearGraph')}
        </Button>
      {/if}
    </section>
  {/if}

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('customGraph.selection')}
    </h3>

    {#if selectedNode}
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center gap-2">
          <Badge variant="default" class="font-mono">{selectedNode.id}</Badge>
          {#if selectedNode.id === store.graph.start}
            <Badge variant="outline">{localeStore.t('node.start')}</Badge>
          {/if}
          {#if selectedNode.id === store.graph.goal}
            <Badge variant="outline">{localeStore.t('node.goal')}</Badge>
          {/if}
        </div>

        <label class="flex flex-col gap-1 text-xs text-muted-foreground">
          {localeStore.t('customGraph.heuristic')}
          <input
            type="number"
            min="0"
            step="1"
            value={selectedNode.heuristic}
            oninput={(e) => store.setNodeHeuristic(selectedNode.id, Number(e.currentTarget.value))}
            class="rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground"
          />
        </label>

        <div class="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            class="flex-1"
            disabled={selectedNode.id === store.graph.start}
            onclick={() => store.setStart(selectedNode.id)}
          >
            {localeStore.t('customGraph.setStart')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="flex-1"
            disabled={selectedNode.id === store.graph.goal}
            onclick={() => store.setGoal(selectedNode.id)}
          >
            {localeStore.t('customGraph.setGoal')}
          </Button>
        </div>

        <Button variant="destructive" size="sm" onclick={() => store.removeNode(selectedNode.id)}>
          <Trash2 class="size-3.5" />
          {localeStore.t('customGraph.deleteNode')}
        </Button>
      </div>
    {:else if selectedEdge}
      <div class="flex flex-col gap-2.5">
        <Badge variant="default" class="font-mono">
          {selectedEdge.source} → {selectedEdge.target}
        </Badge>

        <label class="flex flex-col gap-1 text-xs text-muted-foreground">
          {localeStore.t('customGraph.cost')}
          <input
            type="number"
            min="0"
            step="1"
            value={selectedEdge.cost}
            oninput={(e) => store.setEdgeCost(selectedEdge.id, Number(e.currentTarget.value))}
            class="rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground"
          />
        </label>

        <Button variant="destructive" size="sm" onclick={() => store.removeEdge(selectedEdge.id)}>
          <Trash2 class="size-3.5" />
          {localeStore.t('customGraph.deleteEdge')}
        </Button>
      </div>
    {:else}
      <p class="text-sm text-muted-foreground">{localeStore.t('customGraph.noSelection')}</p>
    {/if}
  </section>

  <Separator />

  <Button variant="default" disabled={!isValidGraph(store.graph)} onclick={onRun}>
    {localeStore.t('customGraph.run')}
  </Button>
</div>

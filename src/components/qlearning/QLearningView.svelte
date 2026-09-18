<script lang="ts">
  import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from '@lucide/svelte'

  import ZoomControls from '@/components/visualization/ZoomControls.svelte'
  import { grid, HEIGHT, WIDTH } from '@/lib/algorithms/qlearning'
  import type { QLearningState } from '@/lib/algorithms/qlearning/types'
  import { bestAction, cellKey } from '@/lib/algorithms/qlearning/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { ZoomState } from '@/lib/zoom.svelte'
  import { cn } from '@/lib/utils'

  interface Props {
    state: QLearningState
  }

  let { state }: Props = $props()

  const zoom = new ZoomState()
  const BASE_CELL_SIZE = 90
  const cellSize = $derived(BASE_CELL_SIZE * zoom.level)

  const arrowIcons = { up: ArrowUp, down: ArrowDown, left: ArrowLeft, right: ArrowRight }

  function maxQ(x: number, y: number): number {
    const qs = state.qTable[cellKey({ x, y })]
    if (!qs) return 0
    return Math.max(qs.up, qs.down, qs.left, qs.right)
  }

  function heatOpacity(x: number, y: number): number {
    const q = maxQ(x, y)
    return Math.min(0.9, Math.max(0, Math.abs(q) / 10))
  }
</script>

<div class="relative h-full w-full">
  <ZoomControls
    zoom={zoom.level}
    canZoomIn={zoom.canZoomIn}
    canZoomOut={zoom.canZoomOut}
    onZoomIn={zoom.zoomIn}
    onZoomOut={zoom.zoomOut}
    onReset={zoom.reset}
  />
  <div class="flex h-full w-full items-center justify-center overflow-auto p-4">
    <div
      class="grid gap-1"
      style={`grid-template-columns: repeat(${WIDTH}, ${cellSize}px); grid-template-rows: repeat(${HEIGHT}, ${cellSize}px);`}
    >
      {#each grid as cell (`${cell.x},${cell.y}`)}
        {@const isAgent = state.agentPos.x === cell.x && state.agentPos.y === cell.y}
        {@const q = maxQ(cell.x, cell.y)}
        {@const Arrow = cell.type === 'normal' || cell.type === 'start' ? arrowIcons[bestAction(state.qTable[cellKey(cell)])] : null}
        <div
          class={cn(
            'relative flex flex-col items-center justify-center rounded-md border-2 font-mono transition-colors duration-200',
            cell.type === 'wall' && 'border-border bg-muted',
            cell.type === 'goal' && 'border-node-path bg-node-path/15',
            cell.type === 'trap' && 'border-destructive bg-destructive/15',
            (cell.type === 'normal' || cell.type === 'start') && 'border-border bg-card',
          )}
        >
          {#if cell.type === 'normal' || cell.type === 'start'}
            <div
              class={cn('absolute inset-0 rounded-md', q >= 0 ? 'bg-node-path' : 'bg-destructive')}
              style={`opacity: ${heatOpacity(cell.x, cell.y)}`}
            ></div>
          {/if}

          <div class="relative flex flex-col items-center gap-0.5">
            {#if cell.type === 'goal'}
              <span class="text-[10px] font-semibold text-node-path">{localeStore.t('qlearning.goal')}</span>
              <span class="text-[9px] text-node-path">+10</span>
            {:else if cell.type === 'trap'}
              <span class="text-[10px] font-semibold text-destructive">{localeStore.t('qlearning.trap')}</span>
              <span class="text-[9px] text-destructive">-10</span>
            {:else if cell.type === 'wall'}
              <span class="text-[9px] text-muted-foreground">{localeStore.t('qlearning.wall')}</span>
            {:else}
              {#if Arrow}
                <Arrow class="size-4 text-muted-foreground" />
              {/if}
              <span class="text-[9px] text-muted-foreground">{q.toFixed(1)}</span>
              {#if cell.type === 'start'}
                <span class="text-[8px] uppercase tracking-wide text-muted-foreground/70">{localeStore.t('qlearning.start')}</span>
              {/if}
            {/if}
          </div>

          {#if isAgent}
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="size-5 rounded-full bg-node-current ring-2 ring-node-current/40"></div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

<script lang="ts">
  import ZoomControls from '@/components/visualization/ZoomControls.svelte'
  import { BOUNDS } from '@/lib/algorithms/knn'
  import type { KNNState } from '@/lib/algorithms/knn/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { ZoomState } from '@/lib/zoom.svelte'

  interface Props {
    state: KNNState
  }

  let { state }: Props = $props()

  const zoom = new ZoomState()

  const SIZE = 480
  const MARGIN = 32
  const BASE_DISPLAY_SIZE = 420
  const displaySize = $derived(BASE_DISPLAY_SIZE * zoom.level)

  function toScreen(x: number, y: number): { cx: number; cy: number } {
    const span = BOUNDS.max - BOUNDS.min
    const cx = MARGIN + ((x - BOUNDS.min) / span) * (SIZE - 2 * MARGIN)
    // Flip vertically: screen y grows downward, math y grows upward.
    const cy = SIZE - MARGIN - ((y - BOUNDS.min) / span) * (SIZE - 2 * MARGIN)
    return { cx, cy }
  }

  const gridLines = $derived.by(() => {
    const lines: number[] = []
    for (let v = Math.ceil(BOUNDS.min); v <= Math.floor(BOUNDS.max); v += 2) lines.push(v)
    return lines
  })

  const queryScreen = $derived(toScreen(state.query.x, state.query.y))

  // Class A / class B use the same "start" / "goal" hues as the search
  // graphs — the tokens are semantically about "the two poles of a
  // distinction," which fits a two-class dataset as well as start/goal.
  // Written as full literal class strings (not built from a dynamic
  // fragment) so Tailwind's scanner can find them.
  function classFor(label: string): string {
    return label === state.classNames[0]
      ? 'fill-node-start stroke-node-start'
      : 'fill-node-goal stroke-node-goal'
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
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={displaySize}
      height={displaySize}
      class="shrink-0"
    >
      <!-- grid -->
      {#each gridLines as v (v)}
        {@const h = toScreen(v, BOUNDS.min)}
        {@const vert = toScreen(BOUNDS.min, v)}
        <line x1={h.cx} y1={MARGIN} x2={h.cx} y2={SIZE - MARGIN} class="stroke-border" stroke-width="1" />
        <line x1={MARGIN} y1={vert.cy} x2={SIZE - MARGIN} y2={vert.cy} class="stroke-border" stroke-width="1" />
      {/each}
      <rect x={MARGIN} y={MARGIN} width={SIZE - 2 * MARGIN} height={SIZE - 2 * MARGIN} fill="none" class="stroke-border" stroke-width="1.5" />

      <!-- distance lines from query to each point, once computed -->
      {#each state.points as entry (entry.point.id)}
        {#if entry.distance !== null}
          {@const p = toScreen(entry.point.x, entry.point.y)}
          <line
            x1={queryScreen.cx}
            y1={queryScreen.cy}
            x2={p.cx}
            y2={p.cy}
            class={entry.point.id === state.currentPointId
              ? 'stroke-node-current'
              : entry.isNeighbor
                ? 'stroke-muted-foreground/50'
                : 'stroke-muted-foreground/15'}
            stroke-width={entry.point.id === state.currentPointId ? 2 : 1}
            stroke-dasharray={entry.isNeighbor ? undefined : '3 3'}
          />
        {/if}
      {/each}

      <!-- data points -->
      {#each state.points as entry (entry.point.id)}
        {@const p = toScreen(entry.point.x, entry.point.y)}
        {@const isCurrent = entry.point.id === state.currentPointId}
        <circle
          cx={p.cx}
          cy={p.cy}
          r={isCurrent ? 9 : 7}
          class={classFor(entry.point.label)}
          fill-opacity={entry.distance !== null && !entry.isNeighbor && state.sorted ? 0.35 : 1}
          stroke-width={entry.isNeighbor ? 3 : 1.5}
        />
        <text x={p.cx} y={p.cy - 12} text-anchor="middle" class="fill-foreground font-mono text-[9px] font-semibold">
          {entry.point.id}
        </text>
        {#if entry.distance !== null}
          <text x={p.cx} y={p.cy + 20} text-anchor="middle" class="fill-muted-foreground font-mono text-[8px]">
            {entry.distance.toFixed(2)}
          </text>
        {/if}
      {/each}

      <!-- query point -->
      <path
        d={`M ${queryScreen.cx} ${queryScreen.cy - 9} L ${queryScreen.cx + 9} ${queryScreen.cy} L ${queryScreen.cx} ${queryScreen.cy + 9} L ${queryScreen.cx - 9} ${queryScreen.cy} Z`}
        class="fill-node-current/30 stroke-node-current"
        stroke-width="2"
      />
      <text x={queryScreen.cx} y={queryScreen.cy - 14} text-anchor="middle" class="fill-node-current font-mono text-[9px] font-semibold">
        {localeStore.t('knn.query')}
      </text>
    </svg>
  </div>
</div>

<script lang="ts">
  import ZoomControls from '@/components/visualization/ZoomControls.svelte'
  import { BOUNDS } from '@/lib/algorithms/kmeans'
  import type { KMeansState } from '@/lib/algorithms/kmeans/types'
  import { ZoomState } from '@/lib/zoom.svelte'

  interface Props {
    state: KMeansState
  }

  let { state }: Props = $props()

  const zoom = new ZoomState()

  const SIZE = 480
  const MARGIN = 32
  const BASE_DISPLAY_SIZE = 420
  const displaySize = $derived(BASE_DISPLAY_SIZE * zoom.level)

  // Three fixed cluster colors — the same semantic tokens used elsewhere
  // for "distinct highlighted states" (start / goal / frontier hues).
  const CLUSTER_CLASSES = [
    'fill-node-start stroke-node-start',
    'fill-node-goal stroke-node-goal',
    'fill-node-frontier stroke-node-frontier',
  ]
  const CLUSTER_STROKE_CLASSES = ['stroke-node-start', 'stroke-node-goal', 'stroke-node-frontier']
  const UNASSIGNED_CLASS = 'fill-muted stroke-muted-foreground'

  function toScreen(x: number, y: number): { cx: number; cy: number } {
    const span = BOUNDS.max - BOUNDS.min
    const cx = MARGIN + ((x - BOUNDS.min) / span) * (SIZE - 2 * MARGIN)
    const cy = SIZE - MARGIN - ((y - BOUNDS.min) / span) * (SIZE - 2 * MARGIN)
    return { cx, cy }
  }

  const gridLines = $derived.by(() => {
    const lines: number[] = []
    for (let v = Math.ceil(BOUNDS.min); v <= Math.floor(BOUNDS.max); v += 2) lines.push(v)
    return lines
  })
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
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={displaySize} height={displaySize} class="shrink-0">
      {#each gridLines as v (v)}
        {@const h = toScreen(v, BOUNDS.min)}
        {@const vert = toScreen(BOUNDS.min, v)}
        <line x1={h.cx} y1={MARGIN} x2={h.cx} y2={SIZE - MARGIN} class="stroke-border" stroke-width="1" />
        <line x1={MARGIN} y1={vert.cy} x2={SIZE - MARGIN} y2={vert.cy} class="stroke-border" stroke-width="1" />
      {/each}
      <rect x={MARGIN} y={MARGIN} width={SIZE - 2 * MARGIN} height={SIZE - 2 * MARGIN} fill="none" class="stroke-border" stroke-width="1.5" />

      <!-- lines from points to their centroid -->
      {#each state.points as entry (entry.point.id)}
        {#if entry.cluster >= 0}
          {@const p = toScreen(entry.point.x, entry.point.y)}
          {@const c = toScreen(state.centroids[entry.cluster].x, state.centroids[entry.cluster].y)}
          <line x1={p.cx} y1={p.cy} x2={c.cx} y2={c.cy} class="stroke-muted-foreground/25" stroke-width="1" />
        {/if}
      {/each}

      <!-- data points -->
      {#each state.points as entry (entry.point.id)}
        {@const pos = toScreen(entry.point.x, entry.point.y)}
        <circle
          cx={pos.cx}
          cy={pos.cy}
          r="7"
          class={entry.cluster >= 0 ? CLUSTER_CLASSES[entry.cluster] : UNASSIGNED_CLASS}
          stroke-width="1.5"
        />
        <text x={pos.cx} y={pos.cy - 12} text-anchor="middle" class="fill-foreground font-mono text-[9px] font-semibold">
          {entry.point.id}
        </text>
      {/each}

      <!-- centroids -->
      {#each state.centroids as centroid, i (i)}
        {@const pos = toScreen(centroid.x, centroid.y)}
        <path
          d={`M ${pos.cx - 9} ${pos.cy - 9} L ${pos.cx + 9} ${pos.cy + 9} M ${pos.cx + 9} ${pos.cy - 9} L ${pos.cx - 9} ${pos.cy + 9}`}
          class={CLUSTER_STROKE_CLASSES[i]}
          stroke-width="3"
        />
        <text x={pos.cx} y={pos.cy + 20} text-anchor="middle" class="fill-foreground font-mono text-[9px] font-semibold">
          C{i + 1}
        </text>
      {/each}
    </svg>
  </div>
</div>

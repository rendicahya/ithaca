<script lang="ts">
  import ZoomControls from '@/components/visualization/ZoomControls.svelte'
  import { BOUNDS_X, BOUNDS_Y, linRegDataset } from '@/lib/algorithms/linreg'
  import type { LinRegState } from '@/lib/algorithms/linreg/types'
  import { ZoomState } from '@/lib/zoom.svelte'

  interface Props {
    state: LinRegState
  }

  let { state }: Props = $props()

  const zoom = new ZoomState()

  const SIZE = 480
  const MARGIN = 32
  const BASE_DISPLAY_SIZE = 420
  const displaySize = $derived(BASE_DISPLAY_SIZE * zoom.level)

  function toScreen(x: number, y: number): { cx: number; cy: number } {
    const cx = MARGIN + ((x - BOUNDS_X.min) / (BOUNDS_X.max - BOUNDS_X.min)) * (SIZE - 2 * MARGIN)
    const cy =
      SIZE - MARGIN - ((y - BOUNDS_Y.min) / (BOUNDS_Y.max - BOUNDS_Y.min)) * (SIZE - 2 * MARGIN)
    return { cx, cy }
  }

  const xGridLines = $derived.by(() => {
    const lines: number[] = []
    for (let v = Math.ceil(BOUNDS_X.min); v <= Math.floor(BOUNDS_X.max); v += 1) lines.push(v)
    return lines
  })
  const yGridLines = $derived.by(() => {
    const lines: number[] = []
    for (let v = Math.ceil(BOUNDS_Y.min); v <= Math.floor(BOUNDS_Y.max); v += 5) lines.push(v)
    return lines
  })

  const line = $derived.by(() => {
    const p1 = toScreen(BOUNDS_X.min, state.m * BOUNDS_X.min + state.b)
    const p2 = toScreen(BOUNDS_X.max, state.m * BOUNDS_X.max + state.b)
    return { p1, p2 }
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
      {#each xGridLines as v (v)}
        {@const h = toScreen(v, BOUNDS_Y.min)}
        <line x1={h.cx} y1={MARGIN} x2={h.cx} y2={SIZE - MARGIN} class="stroke-border" stroke-width="1" />
      {/each}
      {#each yGridLines as v (v)}
        {@const vert = toScreen(BOUNDS_X.min, v)}
        <line x1={MARGIN} y1={vert.cy} x2={SIZE - MARGIN} y2={vert.cy} class="stroke-border" stroke-width="1" />
      {/each}
      <rect x={MARGIN} y={MARGIN} width={SIZE - 2 * MARGIN} height={SIZE - 2 * MARGIN} fill="none" class="stroke-border" stroke-width="1.5" />

      <line
        x1={line.p1.cx}
        y1={line.p1.cy}
        x2={line.p2.cx}
        y2={line.p2.cy}
        class="stroke-node-current"
        stroke-width="2.5"
      />

      {#each linRegDataset as point (point.id)}
        {@const pos = toScreen(point.x, point.y)}
        <circle cx={pos.cx} cy={pos.cy} r="6" class="fill-primary/80 stroke-primary" stroke-width="1.5" />
        <text x={pos.cx} y={pos.cy - 11} text-anchor="middle" class="fill-foreground font-mono text-[9px] font-semibold">
          {point.id}
        </text>
      {/each}
    </svg>
  </div>
</div>

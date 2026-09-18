<script lang="ts">
  import ZoomControls from '@/components/visualization/ZoomControls.svelte'
  import { BOUNDS } from '@/lib/algorithms/logreg'
  import type { LogRegState } from '@/lib/algorithms/logreg/types'
  import { ZoomState } from '@/lib/zoom.svelte'

  interface Props {
    state: LogRegState
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
    const cy = SIZE - MARGIN - ((y - BOUNDS.min) / span) * (SIZE - 2 * MARGIN)
    return { cx, cy }
  }

  const gridLines = $derived.by(() => {
    const lines: number[] = []
    for (let v = Math.ceil(BOUNDS.min); v <= Math.floor(BOUNDS.max); v += 2) lines.push(v)
    return lines
  })

  function classFor(label: 0 | 1): string {
    return label === 0 ? 'fill-node-start stroke-node-start' : 'fill-node-goal stroke-node-goal'
  }

  // Decision boundary w1·x + w2·y + b = 0 → y = -(w1·x + b) / w2. Only drawable
  // once w2 is meaningfully non-zero (it starts at exactly 0 before training).
  const boundary = $derived.by(() => {
    const { w1, w2, b } = state.weights
    if (Math.abs(w2) < 1e-6) return null
    const yAt = (x: number) => -(w1 * x + b) / w2
    const p1 = toScreen(BOUNDS.min, yAt(BOUNDS.min))
    const p2 = toScreen(BOUNDS.max, yAt(BOUNDS.max))
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
      {#each gridLines as v (v)}
        {@const h = toScreen(v, BOUNDS.min)}
        {@const vert = toScreen(BOUNDS.min, v)}
        <line x1={h.cx} y1={MARGIN} x2={h.cx} y2={SIZE - MARGIN} class="stroke-border" stroke-width="1" />
        <line x1={MARGIN} y1={vert.cy} x2={SIZE - MARGIN} y2={vert.cy} class="stroke-border" stroke-width="1" />
      {/each}
      <rect x={MARGIN} y={MARGIN} width={SIZE - 2 * MARGIN} height={SIZE - 2 * MARGIN} fill="none" class="stroke-border" stroke-width="1.5" />

      {#if boundary}
        <line
          x1={boundary.p1.cx}
          y1={boundary.p1.cy}
          x2={boundary.p2.cx}
          y2={boundary.p2.cy}
          class="stroke-node-current"
          stroke-width="2.5"
        />
      {/if}

      {#each state.predictions as p (p.point.id)}
        {@const pos = toScreen(p.point.x, p.point.y)}
        {@const misclassified = p.predictedLabel !== p.point.label}
        <circle
          cx={pos.cx}
          cy={pos.cy}
          r="7"
          class={classFor(p.point.label)}
          stroke-width={misclassified ? 3 : 1.5}
        />
        {#if misclassified}
          <circle cx={pos.cx} cy={pos.cy} r="11" fill="none" class="stroke-destructive" stroke-width="2" stroke-dasharray="3 2" />
        {/if}
        <text x={pos.cx} y={pos.cy - 13} text-anchor="middle" class="fill-foreground font-mono text-[9px] font-semibold">
          {p.point.id}
        </text>
      {/each}
    </svg>
  </div>
</div>

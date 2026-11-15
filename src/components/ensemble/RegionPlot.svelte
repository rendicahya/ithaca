<script lang="ts">
  import { ENSEMBLE_BOUNDS, formatLabel, predict } from '@/lib/algorithms/ensemble'
  import type { Classifier, DataPoint, Label } from '@/lib/algorithms/ensemble'
  import { localeStore } from '@/lib/i18n/locale.svelte'

  interface Props {
    points: DataPoint[]
    query: { x: number; y: number }
    /** Classifier whose decision regions are shaded; null leaves the background blank. */
    focus: Classifier | null
    misclassified?: string[]
    /** Per-point radius multiplier (boosting weights). */
    scale?: number[] | null
    /** Bootstrap multiplicities (bagging); 0 = not drawn. */
    counts?: number[] | null
    /** Ids of points currently held out (stacking fold). */
    highlighted?: string[]
    prediction?: Label | null
    /** Thumbnail mode: no labels, coarser regions. */
    compact?: boolean
    width?: number
  }

  let {
    points,
    query,
    focus,
    misclassified = [],
    scale = null,
    counts = null,
    highlighted = [],
    prediction = null,
    compact = false,
    width = 420,
  }: Props = $props()

  const SIZE = 400
  const MARGIN = $derived(compact ? 4 : 24)
  const INNER = $derived(SIZE - 2 * MARGIN)
  const span = ENSEMBLE_BOUNDS.max - ENSEMBLE_BOUNDS.min
  const resolution = $derived(compact ? 24 : 60)

  function sx(x: number): number {
    return MARGIN + ((x - ENSEMBLE_BOUNDS.min) / span) * INNER
  }
  function sy(y: number): number {
    // Flip vertically: screen y grows downward, math y grows upward.
    return SIZE - MARGIN - ((y - ENSEMBLE_BOUNDS.min) / span) * INNER
  }

  /**
   * Decision regions as run-length rectangles: each grid row is sampled at
   * cell centers and consecutive cells with the same class merge into one
   * rect, which keeps the DOM small even for k-NN / meta-model boundaries.
   */
  const regions = $derived.by(() => {
    if (!focus) return []
    const cell = INNER / resolution
    const rects: { x: number; y: number; w: number; h: number; label: Label }[] = []
    for (let row = 0; row < resolution; row++) {
      const yValue = ENSEMBLE_BOUNDS.max - ((row + 0.5) / resolution) * span
      let start = 0
      let current = predict(focus, { x: ENSEMBLE_BOUNDS.min + (0.5 / resolution) * span, y: yValue })
      for (let col = 1; col <= resolution; col++) {
        const next =
          col < resolution
            ? predict(focus, { x: ENSEMBLE_BOUNDS.min + ((col + 0.5) / resolution) * span, y: yValue })
            : null
        if (next !== current) {
          rects.push({ x: MARGIN + start * cell, y: MARGIN + row * cell, w: (col - start) * cell, h: cell, label: current })
          start = col
          if (next !== null) current = next
        }
      }
    }
    return rects
  })

  const gridValues = [0, 2, 4, 6, 8, 10]

  function radius(i: number): number {
    const base = compact ? 16 : 9
    if (!scale) return base
    // Area proportional to weight, relative to the uniform weight 1/n.
    return Math.max(4, Math.min(26, base * Math.sqrt(scale[i] * points.length)))
  }

  const qx = $derived(sx(query.x))
  const qy = $derived(sy(query.y))
  const queryR = $derived(compact ? 12 : 10)
</script>

<svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={width} height={width} class="shrink-0" role="img">
  <!-- Opacity on the group, not each rect: the slightly overlapping rects
       (which hide anti-aliasing seams) would otherwise double up into stripes. -->
  <g opacity="0.16">
    {#each regions as r, i (i)}
      <rect
        x={r.x}
        y={r.y}
        width={r.w + 0.5}
        height={r.h + 0.5}
        class={r.label === 1 ? 'fill-node-start' : 'fill-node-goal'}
        shape-rendering="crispEdges"
      />
    {/each}
  </g>

  {#if !compact}
    {#each gridValues as v (v)}
      <line x1={sx(v)} y1={MARGIN} x2={sx(v)} y2={SIZE - MARGIN} class="stroke-border" stroke-width="1" />
      <line x1={MARGIN} y1={sy(v)} x2={SIZE - MARGIN} y2={sy(v)} class="stroke-border" stroke-width="1" />
      <text x={sx(v)} y={SIZE - MARGIN + 14} text-anchor="middle" class="fill-muted-foreground font-mono text-[10px]">{v}</text>
      <text x={MARGIN - 6} y={sy(v) + 3} text-anchor="end" class="fill-muted-foreground font-mono text-[10px]">{v}</text>
    {/each}
  {/if}
  <rect x={MARGIN} y={MARGIN} width={INNER} height={INNER} fill="none" class="stroke-border" stroke-width={compact ? 3 : 1.5} />

  {#each points as p, i (p.id)}
    {@const cx = sx(p.x)}
    {@const cy = sy(p.y)}
    {@const r = radius(i)}
    {@const notDrawn = counts !== null && counts[i] === 0}
    {@const isWrong = misclassified.includes(p.id)}
    {@const isHighlighted = highlighted.includes(p.id)}

    {#if isHighlighted}
      <circle {cx} {cy} r={r + 8} fill="none" class="stroke-node-current" stroke-width="3" />
    {/if}
    {#if isWrong}
      <circle {cx} {cy} r={r + (compact ? 6 : 5)} fill="none" class="stroke-destructive" stroke-width={compact ? 4 : 2.5} stroke-dasharray={compact ? undefined : '4 3'} />
    {/if}

    {#if p.label === 1}
      <circle
        {cx}
        {cy}
        {r}
        class="fill-node-start stroke-node-start"
        fill-opacity={notDrawn ? 0.15 : 1}
        stroke-width="2"
        stroke-dasharray={notDrawn ? '3 2' : undefined}
      />
    {:else}
      <rect
        x={cx - r * 0.9}
        y={cy - r * 0.9}
        width={r * 1.8}
        height={r * 1.8}
        class="fill-node-goal stroke-node-goal"
        fill-opacity={notDrawn ? 0.15 : 1}
        stroke-width="2"
        stroke-dasharray={notDrawn ? '3 2' : undefined}
      />
    {/if}

    {#if !compact}
      <text x={cx} y={cy - r - 6} text-anchor="middle" class="fill-foreground font-mono text-[11px] font-semibold">
        {p.id}
      </text>
      {#if counts && counts[i] > 1}
        <text x={cx + r + 4} y={cy + 4} class="fill-node-current font-mono text-[12px] font-bold">×{counts[i]}</text>
      {/if}
    {/if}
  {/each}

  <path
    d={`M ${qx} ${qy - queryR} L ${qx + queryR} ${qy} L ${qx} ${qy + queryR} L ${qx - queryR} ${qy} Z`}
    class={prediction === null
      ? 'fill-node-current/30 stroke-node-current'
      : prediction === 1
        ? 'fill-node-start stroke-node-current'
        : 'fill-node-goal stroke-node-current'}
    stroke-width={compact ? 4 : 2.5}
  />
  {#if !compact}
    <text x={qx} y={qy + queryR + 14} text-anchor="middle" class="fill-node-current font-mono text-[11px] font-semibold">
      {localeStore.t('ensemble.query')}{prediction !== null ? ` → ${formatLabel(prediction)}` : ''}
    </text>
  {/if}
</svg>

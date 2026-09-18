<script lang="ts">
  import { OPTIMUM } from '@/lib/algorithms/pso'
  import type { PSOState } from '@/lib/algorithms/pso/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'

  interface Props {
    state: PSOState
  }

  let { state }: Props = $props()

  const SIZE = 480
  const MARGIN = 32

  function toScreen(x: number, y: number): { cx: number; cy: number } {
    const { min, max } = state.bounds
    const span = max - min
    const cx = MARGIN + ((x - min) / span) * (SIZE - 2 * MARGIN)
    // Flip vertically: screen y grows downward, math y grows upward.
    const cy = SIZE - MARGIN - ((y - min) / span) * (SIZE - 2 * MARGIN)
    return { cx, cy }
  }

  const gridLines = $derived.by(() => {
    const { min, max } = state.bounds
    const lines: number[] = []
    for (let v = Math.ceil(min); v <= Math.floor(max); v++) lines.push(v)
    return lines
  })

  const optimumScreen = $derived(toScreen(OPTIMUM.x, OPTIMUM.y))
  const globalBestScreen = $derived(toScreen(state.globalBest.x, state.globalBest.y))
  const origin = $derived(toScreen(0, 0))
</script>

<div class="flex h-full w-full items-center justify-center overflow-auto p-4">
  <svg viewBox={`0 0 ${SIZE} ${SIZE}`} class="h-full max-h-[520px] w-full max-w-[520px]">
    <!-- grid -->
    {#each gridLines as v (v)}
      {@const h = toScreen(v, state.bounds.min)}
      {@const vert = toScreen(state.bounds.min, v)}
      <line x1={h.cx} y1={MARGIN} x2={h.cx} y2={SIZE - MARGIN} class="stroke-border" stroke-width="1" />
      <line x1={MARGIN} y1={vert.cy} x2={SIZE - MARGIN} y2={vert.cy} class="stroke-border" stroke-width="1" />
    {/each}

    <!-- axes -->
    <line x1={MARGIN} y1={origin.cy} x2={SIZE - MARGIN} y2={origin.cy} class="stroke-muted-foreground/40" stroke-width="1.5" />
    <line x1={origin.cx} y1={MARGIN} x2={origin.cx} y2={SIZE - MARGIN} class="stroke-muted-foreground/40" stroke-width="1.5" />

    <!-- true optimum (for teaching context, like the goal node in search graphs) -->
    <circle
      cx={optimumScreen.cx}
      cy={optimumScreen.cy}
      r="10"
      fill="none"
      class="stroke-node-goal"
      stroke-width="1.5"
      stroke-dasharray="3 3"
    />
    <text x={optimumScreen.cx} y={optimumScreen.cy - 14} text-anchor="middle" class="fill-node-goal font-mono text-[9px] font-medium">
      {localeStore.t('pso.optimum')}
    </text>

    <!-- particles -->
    {#each state.particles as particle (particle.id)}
      {@const pos = toScreen(particle.position.x, particle.position.y)}
      {@const pbest = toScreen(particle.personalBest.x, particle.personalBest.y)}
      {@const isCurrent = state.currentParticleId === particle.id}
      {@const velEnd = toScreen(particle.position.x + particle.velocity.x, particle.position.y + particle.velocity.y)}

      <!-- link to personal best -->
      <line
        x1={pos.cx}
        y1={pos.cy}
        x2={pbest.cx}
        y2={pbest.cy}
        class="stroke-muted-foreground/40"
        stroke-width="1"
        stroke-dasharray="2 3"
      />
      <circle cx={pbest.cx} cy={pbest.cy} r="4" fill="none" class="stroke-muted-foreground" stroke-width="1.5" />

      <!-- velocity vector -->
      <line
        x1={pos.cx}
        y1={pos.cy}
        x2={velEnd.cx}
        y2={velEnd.cy}
        class={isCurrent ? 'stroke-node-current' : 'stroke-muted-foreground/60'}
        stroke-width="1.5"
        marker-end="url(#pso-arrow)"
      />

      <circle
        cx={pos.cx}
        cy={pos.cy}
        r={isCurrent ? 9 : 7}
        class={isCurrent
          ? 'fill-node-current stroke-node-current'
          : 'fill-primary/80 stroke-primary'}
        stroke-width="2"
      />
      <text x={pos.cx} y={pos.cy - 12} text-anchor="middle" class="fill-foreground font-mono text-[9px] font-semibold">
        {particle.id}
      </text>
    {/each}

    <!-- global best -->
    <path
      d={`M ${globalBestScreen.cx} ${globalBestScreen.cy - 9} L ${globalBestScreen.cx + 9} ${globalBestScreen.cy} L ${globalBestScreen.cx} ${globalBestScreen.cy + 9} L ${globalBestScreen.cx - 9} ${globalBestScreen.cy} Z`}
      class="fill-node-path/20 stroke-node-path"
      stroke-width="2"
    />

    <defs>
      <marker id="pso-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" class="fill-node-current">
        <path d="M0,0 L6,3 L0,6 Z" />
      </marker>
    </defs>
  </svg>
</div>

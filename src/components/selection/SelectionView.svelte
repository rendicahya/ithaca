<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import type { SelectionState } from '@/lib/algorithms/selection/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'

  interface Props {
    state: SelectionState
  }

  // Renamed on destructure — a local binding literally called `state` would
  // collide with the `$state` rune used below (Svelte parses `$state` as
  // `$` + the identifier `state`, so the two become ambiguous).
  let { state: sel }: Props = $props()

  // Distinct fill for each population slot — same idea as the fixed cluster
  // colors elsewhere, just extended to cover a 5-individual wheel.
  const SLICE_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed']

  const WHEEL_CENTER = 50
  const WHEEL_RADIUS = 46
  const LABEL_RADIUS = 30

  function pointOnCircle(deg: number): { x: number; y: number } {
    const rad = (deg * Math.PI) / 180
    return {
      x: WHEEL_CENTER + WHEEL_RADIUS * Math.sin(rad),
      y: WHEEL_CENTER - WHEEL_RADIUS * Math.cos(rad),
    }
  }

  function labelPoint(deg: number): { x: number; y: number } {
    const rad = (deg * Math.PI) / 180
    return {
      x: WHEEL_CENTER + LABEL_RADIUS * Math.sin(rad),
      y: WHEEL_CENTER - LABEL_RADIUS * Math.cos(rad),
    }
  }

  function sliceArcPath(startDeg: number, endDeg: number): string {
    const start = pointOnCircle(startDeg)
    const end = pointOnCircle(endDeg)
    const largeArc = endDeg - startDeg > 180 ? 1 : 0
    return `M ${WHEEL_CENTER} ${WHEEL_CENTER} L ${start.x} ${start.y} A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
  }

  const wheelSlices = $derived.by(() => {
    let acc = 0
    return sel.population.map((p, i) => {
      const startDeg = (acc / sel.totalFitness) * 360
      acc += p.fitness
      const endDeg = (acc / sel.totalFitness) * 360
      const mid = labelPoint((startDeg + endDeg) / 2)
      return {
        id: p.id,
        fitness: p.fitness,
        color: SLICE_COLORS[i % SLICE_COLORS.length],
        path: sliceArcPath(startDeg, endDeg),
        labelX: mid.x,
        labelY: mid.y,
        wide: endDeg - startDeg >= 20,
      }
    })
  })

  const showRoulette = $derived(
    sel.phase === 'rouletteSetup' ||
      sel.phase === 'rouletteSpin' ||
      sel.phase === 'tournamentPick' ||
      sel.phase === 'tournamentWinner',
  )
  const showTournament = $derived(sel.phase === 'tournamentPick' || sel.phase === 'tournamentWinner')

  // The needle animates from 0 to several full turns past its resting angle
  // whenever spinFraction newly appears (i.e. the spin just happened), so the
  // wheel visibly spins rather than jumping straight to the winning slice.
  // Stepping forward past this point, or backward to before it, does not
  // replay the animation — only the null → number transition does.
  const EXTRA_SPINS = 4
  const SPIN_DURATION_MS = 1400
  let needleDeg = $state(0)

  $effect(() => {
    if (sel.spinFraction === null) {
      needleDeg = 0
      return
    }
    const target = sel.spinFraction * 360
    needleDeg = 0
    requestAnimationFrame(() => {
      needleDeg = EXTRA_SPINS * 360 + target
    })
  })
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('selection.populationLabel')}
    </h3>
    <div class="flex flex-wrap gap-1.5">
      {#each sel.population as p, i (p.id)}
        <Badge
          variant={p.id === sel.rouletteWinnerId || p.id === sel.tournamentWinnerId
            ? 'default'
            : sel.tournamentCandidateIds.includes(p.id)
              ? 'outline'
              : 'secondary'}
          class="gap-1.5 font-mono"
        >
          <span
            class="inline-block size-2 rounded-full"
            style={`background: ${SLICE_COLORS[i % SLICE_COLORS.length]}`}
          ></span>
          {p.id}: {p.fitness}
        </Badge>
      {/each}
    </div>
  </section>

  <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <section class="rounded-md border border-border bg-card p-3">
      <h3 class="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {localeStore.t('selection.roulette')}
      </h3>
      {#if showRoulette}
        <div class="relative mx-auto size-36">
          <svg viewBox="0 0 100 100" class="size-36 rounded-full border border-border">
            {#each wheelSlices as slice (slice.id)}
              <path d={slice.path} fill={slice.color} stroke="var(--color-card)" stroke-width="0.5" />
              {#if slice.wide}
                <text
                  x={slice.labelX}
                  y={slice.labelY}
                  text-anchor="middle"
                  dominant-baseline="middle"
                  font-size="7"
                  font-weight="600"
                  fill="white"
                >
                  {slice.id}
                </text>
              {/if}
            {/each}
          </svg>
          {#if sel.spinFraction !== null}
            <div
              class="absolute left-1/2 top-1/2 h-0.5 w-16 origin-left rounded-full bg-foreground transition-transform ease-out"
              style={`transition-duration: ${SPIN_DURATION_MS}ms; transform: translateY(-50%) rotate(${needleDeg - 90}deg)`}
            ></div>
            <div
              class="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
            ></div>
          {/if}
        </div>
        {#if sel.rouletteWinnerId}
          <p class="mt-3 text-center text-xs text-muted-foreground">
            {localeStore.t('selection.winner')}:
            <span class="font-mono font-semibold text-foreground">{sel.rouletteWinnerId}</span>
          </p>
        {/if}
      {:else}
        <p class="text-xs text-muted-foreground">{localeStore.t('common.noneYet')}</p>
      {/if}
    </section>

    <section class="rounded-md border border-border bg-card p-3">
      <h3 class="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {localeStore.t('selection.tournamentTitle')}
      </h3>
      {#if showTournament}
        <div class="flex flex-wrap justify-center gap-2">
          {#each sel.population as p (p.id)}
            {#if sel.tournamentCandidateIds.includes(p.id)}
              <div
                class={`flex size-14 flex-col items-center justify-center rounded-md border-2 font-mono text-xs ${
                  p.id === sel.tournamentWinnerId
                    ? 'border-primary bg-primary text-primary-foreground font-semibold'
                    : 'border-border bg-background text-foreground'
                }`}
              >
                <span>{p.id}</span>
                <span>{p.fitness}</span>
              </div>
            {/if}
          {/each}
        </div>
        {#if sel.tournamentWinnerId}
          <p class="mt-3 text-center text-xs text-muted-foreground">
            {localeStore.t('selection.winner')}:
            <span class="font-mono font-semibold text-foreground">{sel.tournamentWinnerId}</span>
          </p>
        {/if}
      {:else}
        <p class="text-xs text-muted-foreground">{localeStore.t('common.noneYet')}</p>
      {/if}
    </section>
  </div>
</div>

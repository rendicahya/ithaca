<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import { formatVec } from '@/lib/algorithms/pso'
  import type { PSOState } from '@/lib/algorithms/pso/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  interface Props {
    state: PSOState
  }

  let { state }: Props = $props()
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <div class="flex flex-wrap items-center gap-2">
    <Badge variant="default" class="font-mono">
      {localeStore.t('pso.iteration')}: {Math.min(state.iteration, state.maxIterations)} / {state.maxIterations}
    </Badge>
    <Badge variant="outline" class="font-mono">w={state.inertiaWeight}</Badge>
    <Badge variant="outline" class="font-mono">c1={state.cognitiveCoeff}</Badge>
    <Badge variant="outline" class="font-mono">c2={state.socialCoeff}</Badge>
  </div>

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('pso.globalBest')}
    </h3>
    <p class="font-mono text-sm font-semibold text-node-path">{formatVec(state.globalBest)}</p>
    <p class="mt-1 text-xs text-muted-foreground">
      {localeStore.t('pso.fitness')}: {state.globalBestFitness.toFixed(3)}
    </p>
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('pso.particles')}
    </h3>
    <div class="flex flex-col gap-1.5">
      {#each state.particles as particle (particle.id)}
        <div
          class={cn(
            'rounded-md border p-2 font-mono text-xs',
            state.currentParticleId === particle.id
              ? 'border-node-current bg-node-current/10'
              : 'border-border bg-card',
          )}
        >
          <div class="mb-1 flex items-center justify-between">
            <span class="font-semibold">{particle.id}</span>
            <span class="text-muted-foreground">{localeStore.t('pso.fitness')}: {particle.fitness.toFixed(2)}</span>
          </div>
          <div class="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
            <span>{localeStore.t('pso.position')}: {formatVec(particle.position)}</span>
            <span>{localeStore.t('pso.velocity')}: {formatVec(particle.velocity)}</span>
            <span>{localeStore.t('pso.personalBest')}: {formatVec(particle.personalBest)} ({particle.personalBestFitness.toFixed(2)})</span>
          </div>
        </div>
      {/each}
    </div>
  </section>

  {#if state.done}
    <Separator />
    <section>
      <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {localeStore.t('pso.resultLabel')}
      </h3>
      <p class="font-mono text-sm font-semibold text-node-path">{formatVec(state.globalBest)}</p>
      <p class="mt-1 text-xs text-muted-foreground">
        {localeStore.t('pso.fitness')}: {state.globalBestFitness.toFixed(3)}
      </p>
    </section>
  {/if}
</div>

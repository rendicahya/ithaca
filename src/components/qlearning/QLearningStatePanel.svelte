<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import { cellKey } from '@/lib/algorithms/qlearning'
  import type { QLearningState } from '@/lib/algorithms/qlearning/types'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  interface Props {
    state: QLearningState
  }

  let { state }: Props = $props()

  const agentQValues = $derived(state.qTable[cellKey(state.agentPos)])
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <div class="flex flex-wrap items-center gap-2">
    <Badge variant="default" class="font-mono">
      {localeStore.t('qlearning.episode')}: {Math.min(state.episode, state.maxEpisodes)} / {state.maxEpisodes}
    </Badge>
    <Badge variant="outline" class="font-mono">ε = {state.epsilon.toFixed(2)}</Badge>
    <Badge variant="outline" class="font-mono">α = {state.alpha}</Badge>
    <Badge variant="outline" class="font-mono">γ = {state.gamma}</Badge>
  </div>

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('qlearning.lastMove')}
    </h3>
    {#if state.lastAction}
      <p class="font-mono text-sm">
        <span class={cn('font-semibold', state.wasExploration ? 'text-node-current' : 'text-node-frontier')}>
          {state.wasExploration ? localeStore.t('qlearning.explore') : localeStore.t('qlearning.exploit')}
        </span>
        — {state.lastAction} ({localeStore.t('qlearning.reward')}: {state.lastReward})
      </p>
    {:else}
      <span class="text-sm text-muted-foreground">{localeStore.t('common.noneYet')}</span>
    {/if}
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('qlearning.qValues')} ({state.agentPos.x}, {state.agentPos.y})
    </h3>
    {#if agentQValues}
      <div class="grid grid-cols-2 gap-1.5 font-mono text-xs">
        <div class="rounded-md border border-border bg-card px-2 py-1">up: {agentQValues.up.toFixed(2)}</div>
        <div class="rounded-md border border-border bg-card px-2 py-1">down: {agentQValues.down.toFixed(2)}</div>
        <div class="rounded-md border border-border bg-card px-2 py-1">left: {agentQValues.left.toFixed(2)}</div>
        <div class="rounded-md border border-border bg-card px-2 py-1">right: {agentQValues.right.toFixed(2)}</div>
      </div>
    {/if}
  </section>

  {#if state.done}
    <Separator />
    <section>
      <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {localeStore.t('qlearning.result')}
      </h3>
      <p class="text-xs text-muted-foreground">{localeStore.t('qlearning.resultDescription')}</p>
    </section>
  {/if}
</div>

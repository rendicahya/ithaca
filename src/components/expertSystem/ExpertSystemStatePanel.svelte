<script lang="ts">
  import { Separator } from '@/components/ui/separator'
  import { conclusionRules, factorIds, factorKey, optionKey, riskLevels } from '@/lib/algorithms/expertSystem'
  import type { ESState } from '@/lib/algorithms/expertSystem'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { msg } from '@/lib/i18n/translate'
  import { cn } from '@/lib/utils'

  import { levelBorderClass, levelHeaderClass, levelTintClass } from './riskLevelStyles'

  interface Props {
    state: ESState
  }

  let { state }: Props = $props()

  const firedRule = $derived(state.ruleChecks.find((c) => c.fired)?.rule ?? null)
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('expertSystem.conclusionLabel')}
    </h3>
    {#if state.conclusion && firedRule}
      <div class={cn('rounded-md border-2 p-3', levelBorderClass[state.conclusion], levelTintClass[state.conclusion])}>
        <span class={cn('rounded px-2 py-0.5 text-sm font-semibold', levelHeaderClass[state.conclusion])}>
          {localeStore.t(`expertSystem.level.${state.conclusion}`)}
        </span>
        <p class="mt-2 text-sm font-medium">
          {localeStore.t(`expertSystem.advice.${firedRule === 'default' ? 'default' : state.conclusion}`)}
        </p>
      </div>
    {:else}
      <span class="text-sm text-muted-foreground">{localeStore.t('common.noneYet')}</span>
    {/if}
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('expertSystem.scoreLabel')}
    </h3>
    <div class="grid grid-cols-3 gap-1.5">
      {#each riskLevels as level (level)}
        <div class={cn('rounded-md px-2 py-1.5 text-center', levelTintClass[level])}>
          <div class="font-mono text-2xl font-bold tabular-nums">{state.score[level]}</div>
          <div class="text-[11px] leading-tight">{localeStore.t(`expertSystem.level.${level}`)}</div>
        </div>
      {/each}
    </div>
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('expertSystem.workingMemory')}
    </h3>
    <ul class="space-y-1 text-xs">
      {#each factorIds as factor (factor)}
        {@const level = state.answers[factor]}
        <li
          class={cn(
            'flex items-start justify-between gap-2 rounded px-1.5 py-0.5',
            state.currentFactor === factor && 'bg-node-current/20',
          )}
        >
          <span class="min-w-0 text-muted-foreground">{localeStore.t(factorKey(factor))}</span>
          <span
            class={cn(
              'max-w-[55%] rounded px-1.5 text-right font-medium',
              state.scoredFactors.includes(factor) && levelTintClass[level],
            )}
          >
            {localeStore.t(optionKey(factor, level))}
          </span>
        </li>
      {/each}
    </ul>
  </section>

  <Separator />

  <section class="space-y-1.5 text-xs">
    <h3 class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('expertSystem.knowledgeBase')}
    </h3>
    <p>
      {localeStore.t(
        msg('expertSystem.kbSummary', { scoring: factorIds.length, conclusion: conclusionRules.length }),
      )}
    </p>
    <p class="text-muted-foreground">{localeStore.t('expertSystem.role')}</p>
  </section>
</div>

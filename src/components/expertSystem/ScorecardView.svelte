<script lang="ts">
  import { CircleCheck, CircleDashed, CircleX, Info } from '@lucide/svelte'

  import {
    conclusionRules,
    conditionKey,
    factorIds,
    factorKey,
    optionKey,
    riskLevels,
  } from '@/lib/algorithms/expertSystem'
  import type { ConclusionRuleId, ESState, FactorId, RiskLevel } from '@/lib/algorithms/expertSystem'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  import { levelBorderClass, levelHeaderClass, levelTintClass } from './riskLevelStyles'

  interface Props {
    state: ESState
    onAnswer: (factor: FactorId, level: RiskLevel) => void
  }

  let { state, onAnswer }: Props = $props()

  function ruleStatus(rule: ConclusionRuleId): 'pending' | 'fired' | 'failed' {
    const check = state.ruleChecks.find((c) => c.rule === rule)
    if (!check) return 'pending'
    return check.fired ? 'fired' : 'failed'
  }

  function handleChange(event: Event, factor: FactorId, level: RiskLevel): void {
    // Hand focus back to the page so PageUp/PageDown (presenter remote) keep
    // stepping — global shortcuts are ignored while an input has focus.
    ;(event.currentTarget as HTMLInputElement).blur()
    onAnswer(factor, level)
  }
</script>

<div class="flex h-full flex-col gap-3 overflow-y-auto p-4 scrollbar-thin">
  <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
    <h2 class="text-lg font-semibold tracking-tight">{localeStore.t('expertSystem.title')}</h2>
    <span class="text-xs text-muted-foreground">{localeStore.t('expertSystem.source')}</span>
  </div>

  <p class="flex items-start gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
    <Info class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
    {localeStore.t('expertSystem.instructions')}
  </p>

  <div class="shrink-0 overflow-hidden rounded-lg border border-border">
    <table class="w-full table-fixed border-collapse text-sm">
      <thead>
        <tr>
          <th class="w-[22%] bg-primary px-3 py-2 text-left text-primary-foreground">
            {localeStore.t('expertSystem.riskFactor')}
          </th>
          {#each riskLevels as level (level)}
            <th class={cn('px-3 py-2 text-left', levelHeaderClass[level])}>
              {localeStore.t(`expertSystem.level.${level}`)}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each factorIds as factor (factor)}
          {@const isCurrent = state.currentFactor === factor}
          {@const isScored = state.scoredFactors.includes(factor)}
          <tr
            class={cn(
              'border-t border-border transition-colors',
              isCurrent && 'outline outline-2 -outline-offset-2 outline-node-current',
            )}
          >
            <th
              scope="row"
              class={cn('px-3 py-1.5 text-left font-medium', isCurrent && 'bg-node-current/20')}
            >
              {localeStore.t(factorKey(factor))}
            </th>
            {#each riskLevels as level (level)}
              {@const selected = state.answers[factor] === level}
              <td class={cn('p-0', selected && levelTintClass[level])}>
                <label class="flex cursor-pointer items-center gap-2 px-3 py-1.5">
                  <input
                    type="radio"
                    class="size-4 shrink-0 accent-primary"
                    name={`stroke-${factor}`}
                    checked={selected}
                    onchange={(e) => handleChange(e, factor, level)}
                  />
                  <span class={cn('min-w-0 flex-1', selected ? 'font-semibold' : 'text-muted-foreground')}>
                    {localeStore.t(optionKey(factor, level))}
                  </span>
                  {#if selected && isScored}
                    <span
                      class={cn(
                        'shrink-0 rounded px-1.5 font-mono text-xs font-semibold',
                        levelHeaderClass[level],
                      )}
                    >
                      +1
                    </span>
                  {/if}
                </label>
              </td>
            {/each}
          </tr>
        {/each}
        <tr class="border-t-2 border-border">
          <th scope="row" class="px-3 py-2 text-left font-semibold uppercase tracking-wide">
            {localeStore.t('expertSystem.totalScore')}
          </th>
          {#each riskLevels as level (level)}
            <td class={cn('px-3 py-2', levelTintClass[level])}>
              <span class="font-mono text-xl font-bold tabular-nums">{state.score[level]}</span>
              <span class="ml-1 text-xs text-muted-foreground">
                {localeStore.t(`expertSystem.level.${level}`)}
              </span>
            </td>
          {/each}
        </tr>
      </tbody>
    </table>
  </div>

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('expertSystem.conclusionRules')}
    </h3>
    <ol class="grid gap-2 sm:grid-cols-2">
      {#each conclusionRules as rule (rule.id)}
        {@const status = ruleStatus(rule.id)}
        <li
          class={cn(
            'flex items-start gap-2 rounded-md border px-3 py-2 text-sm',
            status === 'fired' ? cn('border-2', levelBorderClass[rule.conclusion], levelTintClass[rule.conclusion]) : 'border-border',
            status === 'failed' && 'opacity-60',
          )}
        >
          {#if status === 'fired'}
            <CircleCheck class="mt-0.5 size-4 shrink-0" />
          {:else if status === 'failed'}
            <CircleX class="mt-0.5 size-4 shrink-0" />
          {:else}
            <CircleDashed class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          {/if}
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span class="font-mono font-semibold">
                {rule.id === 'default' ? 'Default' : rule.id.toUpperCase()}:
              </span>
              <span class="font-mono">IF {localeStore.t(conditionKey(rule.id))} THEN</span>
              <span class={cn('rounded px-1.5 text-xs font-semibold', levelHeaderClass[rule.conclusion])}>
                {localeStore.t(`expertSystem.level.${rule.conclusion}`)}
              </span>
              <span class="ml-auto text-xs text-muted-foreground">
                {localeStore.t(`expertSystem.rule.${status}`)}
              </span>
            </div>
            {#if status === 'fired'}
              <p class="mt-1 font-medium">
                {localeStore.t(`expertSystem.advice.${rule.id === 'default' ? 'default' : rule.conclusion}`)}
              </p>
            {/if}
            {#if rule.id === 'default'}
              <p class="mt-1 text-xs text-muted-foreground">{localeStore.t('expertSystem.defaultRuleNote')}</p>
            {/if}
          </div>
        </li>
      {/each}
    </ol>
  </section>
</div>

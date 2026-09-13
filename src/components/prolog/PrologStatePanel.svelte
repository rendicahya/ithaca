<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import StackView from '@/components/state/StackView.svelte'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { msg } from '@/lib/i18n/translate'
  import { clauseToString, termToString } from '@/lib/prolog/terms'
  import type { Clause, Term } from '@/lib/prolog/terms'
  import type { ProofState } from '@/lib/prolog/types'

  import BindingsTable from './BindingsTable.svelte'

  interface Props {
    state: ProofState
    database: Clause[]
    query: Term
  }

  let { state, database, query }: Props = $props()

  const currentGoalText = $derived.by(() => {
    const node = state.treeNodes.find((n) => n.id === state.currentGoalId)
    return node ? termToString(node.term, state.bindings) : null
  })

  const goalItems = $derived(state.goals.map((f) => termToString(f.term, state.bindings)))

  const choicePointItems = $derived(
    state.choicePoints.map(
      (cp) => `${termToString(cp.term, state.bindings)} (${cp.remaining})`,
    ),
  )

  const solutionItems = $derived(
    state.solutions.map((sol) =>
      Object.entries(sol)
        .map(([name, term]) => `${name} = ${termToString(term)}`)
        .join(', '),
    ),
  )
</script>

<div class="flex h-full flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('prolog.query')}
    </h3>
    <p class="font-mono text-sm font-semibold">{termToString(query)}?</p>
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('prolog.knowledgeBase')}
    </h3>
    <div class="flex flex-col gap-0.5 font-mono text-xs text-muted-foreground">
      {#each database as clause, i (i)}
        <span>{clauseToString(clause)}</span>
      {/each}
    </div>
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('prolog.currentGoal')}
    </h3>
    {#if currentGoalText}
      <Badge variant="default" class="font-mono text-sm">{currentGoalText}</Badge>
    {:else}
      <span class="text-sm text-muted-foreground">—</span>
    {/if}
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('prolog.goalStack')}
    </h3>
    <StackView items={goalItems} />
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('prolog.choicePoints')}
    </h3>
    <StackView items={choicePointItems} />
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('prolog.bindings')}
    </h3>
    <BindingsTable bindings={state.queryBindings} />
  </section>

  <Separator />

  <section>
    <h3 class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t(msg('prolog.solutions', { count: state.solutions.length }))}
    </h3>
    {#if solutionItems.length === 0}
      <span class="text-sm text-muted-foreground">{localeStore.t('prolog.noSolutionsYet')}</span>
    {:else}
      <ol class="space-y-1">
        {#each solutionItems as item, i (i)}
          <li class="font-mono text-sm font-semibold text-node-path">{i + 1}. {item}</li>
        {/each}
      </ol>
    {/if}
  </section>
</div>

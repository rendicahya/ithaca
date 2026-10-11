<script lang="ts">
  import { Undo2 } from '@lucide/svelte'

  import { Button } from '@/components/ui/button'
  import { Separator } from '@/components/ui/separator'
  import { componentIcons, componentKey, subcomponentKey, subcomponents } from '@/lib/algorithms/esArchitecture'
  import type { ArchState, ComponentId } from '@/lib/algorithms/esArchitecture'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { msg } from '@/lib/i18n/translate'
  import type { Message } from '@/lib/i18n/translate'

  interface Props {
    state: ArchState
    /** Concrete example of the current step; stays visible while a box is inspected. */
    example: Message
    /** The example as Prolog code, on steps where the knowledge base is being written. */
    prolog?: Message
    selected: ComponentId | null
    onClearSelection: () => void
  }

  let { state, example, prolog, selected, onClearSelection }: Props = $props()

  // A clicked box wins; otherwise explain what the current step is about.
  const shown = $derived(selected ?? state.focus)
  const order = $derived(state.firstVisit[shown])
  const isEnvironment = $derived(shown === 'consultationEnv' || shown === 'developmentEnv')
</script>

<div class="flex h-full flex-col gap-3 overflow-y-auto p-4 scrollbar-thin">
  <section class="rounded-md border border-node-current/50 bg-node-current/10 px-3 py-2.5">
    <h3 class="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('esArch.exampleLabel')}
    </h3>
    <p class="whitespace-pre-line text-sm leading-relaxed">{localeStore.t(example)}</p>
  </section>

  {#if prolog}
    <section>
      <h3 class="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {localeStore.t('esArch.prologLabel')}
      </h3>
      <pre
        class="overflow-x-auto rounded-md border border-border bg-muted/50 px-3 py-2.5 font-mono text-xs leading-relaxed scrollbar-thin">{localeStore.t(
          prolog,
        )}</pre>
    </section>
  {/if}

  <div class="flex items-center justify-between gap-2">
    <h3 class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t(selected ? 'esArch.selectedLabel' : 'esArch.focusLabel')}
    </h3>
    {#if selected}
      <Button variant="ghost" size="sm" class="h-6 gap-1 px-2 text-xs" onclick={onClearSelection}>
        <Undo2 class="size-3.5" />
        {localeStore.t('esArch.followStep')}
      </Button>
    {/if}
  </div>

  <div>
    <p class="flex items-center gap-2 text-lg font-semibold leading-tight">
      {#if componentIcons[shown]}
        <span class="text-2xl" aria-hidden="true">{componentIcons[shown]}</span>
      {/if}
      {localeStore.t(componentKey(shown, 'name'))}
    </p>
    {#if !isEnvironment}
      <p class="mt-1 text-xs text-muted-foreground">
        {order !== undefined ? localeStore.t(msg('esArch.order', { n: order })) : localeStore.t('esArch.notReached')}
      </p>
    {/if}
  </div>

  <Separator />

  <section>
    <h4 class="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('esArch.descriptionLabel')}
    </h4>
    <p class="text-sm leading-relaxed">{localeStore.t(componentKey(shown, 'description'))}</p>
  </section>

  <section>
    <h4 class="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t('esArch.functionLabel')}
    </h4>
    <p class="text-sm leading-relaxed">{localeStore.t(componentKey(shown, 'function'))}</p>
  </section>

  {#if subcomponents[shown]}
    <section>
      <h4 class="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {localeStore.t('esArch.subcomponentsLabel')}
      </h4>
      <dl class="space-y-2 text-sm">
        {#each subcomponents[shown] ?? [] as sub (sub)}
          <div class="rounded-md border border-border px-2.5 py-1.5">
            <dt class="font-medium">{localeStore.t(subcomponentKey(shown, sub, 'name'))}</dt>
            <dd class="text-xs leading-relaxed text-muted-foreground">
              {localeStore.t(subcomponentKey(shown, sub, 'description'))}
            </dd>
          </div>
        {/each}
      </dl>
    </section>
  {/if}
</div>

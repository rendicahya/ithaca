<script lang="ts">
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { termToString } from '@/lib/prolog/terms'
  import type { Term } from '@/lib/prolog/terms'

  interface Props {
    bindings: Record<string, Term | null>
  }

  let { bindings }: Props = $props()
  const entries = $derived(Object.entries(bindings))
</script>

<div class="space-y-1.5">
  {#if entries.length === 0}
    <span class="text-sm text-muted-foreground">—</span>
  {:else}
    <div class="flex flex-col gap-1">
      {#each entries as [name, value] (name)}
        <div
          class="flex items-center justify-between rounded-md border border-border bg-secondary px-2.5 py-1.5 font-mono text-sm text-secondary-foreground"
        >
          <span class="font-bold">{name}</span>
          <span class={value ? '' : 'italic text-muted-foreground'}>
            {value ? termToString(value) : localeStore.t('prolog.unbound')}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</div>

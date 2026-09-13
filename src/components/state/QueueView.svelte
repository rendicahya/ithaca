<script lang="ts">
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  interface Props {
    items: string[]
  }

  let { items }: Props = $props()
</script>

<div class="space-y-1.5">
  <div class="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
    <span>{localeStore.t('queue.front')}</span>
    <span>{localeStore.t('queue.back')}</span>
  </div>
  {#if items.length === 0}
    <p class="rounded-md border border-dashed border-border py-3 text-center text-xs text-muted-foreground">
      {localeStore.t('queue.empty')}
    </p>
  {:else}
    <div class="flex flex-wrap items-center gap-1.5">
      {#each items as item, i (item)}
        <div
          class={cn(
            'flex h-9 min-w-9 items-center justify-center rounded-md border px-2 font-mono text-sm font-semibold',
            i === 0
              ? 'border-node-frontier bg-node-frontier text-node-frontier-foreground'
              : 'border-border bg-secondary text-secondary-foreground',
          )}
        >
          {item}
        </div>
        {#if i < items.length - 1}
          <span class="text-muted-foreground">→</span>
        {/if}
      {/each}
    </div>
  {/if}
</div>

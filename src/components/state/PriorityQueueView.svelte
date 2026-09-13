<script lang="ts">
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { msg } from '@/lib/i18n/translate'
  import { cn } from '@/lib/utils'

  interface PriorityItem {
    id: string
    g?: number
    h?: number
    f?: number
  }

  interface Props {
    items: PriorityItem[]
    orderBy: 'g' | 'h' | 'f'
  }

  let { items, orderBy }: Props = $props()

  const sorted = $derived(
    [...items].sort((a, b) => {
      const av = a[orderBy] ?? Infinity
      const bv = b[orderBy] ?? Infinity
      return av !== bv ? av - bv : a.id.localeCompare(b.id)
    }),
  )
</script>

<div class="space-y-1.5">
  <div class="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
    {localeStore.t(msg('priorityQueue.orderedBy', { order: orderBy }))}
  </div>
  {#if sorted.length === 0}
    <p class="rounded-md border border-dashed border-border py-3 text-center text-xs text-muted-foreground">
      {localeStore.t('priorityQueue.empty')}
    </p>
  {:else}
    <div class="flex flex-wrap items-center gap-1.5">
      {#each sorted as item, i (item.id)}
        <div
          class={cn(
            'flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-sm',
            i === 0
              ? 'border-node-frontier bg-node-frontier text-node-frontier-foreground font-semibold'
              : 'border-border bg-secondary text-secondary-foreground',
          )}
        >
          <span class="text-[10px] font-semibold opacity-70">{i + 1}</span>
          <span class="font-bold">{item.id}</span>
          <span class="flex gap-1.5 text-xs opacity-90">
            {#if item.g !== undefined}<span>g={item.g}</span>{/if}
            {#if item.h !== undefined}<span>h={item.h}</span>{/if}
            {#if item.f !== undefined}<span class="font-semibold">f={item.f}</span>{/if}
          </span>
        </div>
        {#if i < sorted.length - 1}
          <span class="text-muted-foreground">→</span>
        {/if}
      {/each}
    </div>
  {/if}
</div>

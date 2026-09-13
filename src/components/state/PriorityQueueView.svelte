<script lang="ts">
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
    Ordered by {orderBy}(n) — smallest first
  </div>
  {#if sorted.length === 0}
    <p class="rounded-md border border-dashed border-border py-3 text-center text-xs text-muted-foreground">
      Empty
    </p>
  {:else}
    <div class="flex flex-col gap-1">
      {#each sorted as item, i (item.id)}
        <div
          class={cn(
            'flex items-center justify-between rounded-md border px-2.5 py-1.5 font-mono text-sm',
            i === 0
              ? 'border-node-frontier bg-node-frontier text-node-frontier-foreground font-semibold'
              : 'border-border bg-secondary text-secondary-foreground',
          )}
        >
          <span class="font-bold">{item.id}</span>
          <span class="flex gap-2 text-xs opacity-90">
            {#if item.g !== undefined}<span>g={item.g}</span>{/if}
            {#if item.h !== undefined}<span>h={item.h}</span>{/if}
            {#if item.f !== undefined}<span class="font-semibold">f={item.f}</span>{/if}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</div>

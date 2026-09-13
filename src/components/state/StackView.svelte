<script lang="ts">
  import { cn } from '@/lib/utils'

  interface Props {
    items: string[]
  }

  let { items }: Props = $props()
  const reversed = $derived([...items].reverse())
</script>

<div class="space-y-1.5">
  <div class="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Top of stack</div>
  {#if items.length === 0}
    <p class="rounded-md border border-dashed border-border py-3 text-center text-xs text-muted-foreground">
      Empty
    </p>
  {:else}
    <div class="flex flex-col gap-1.5">
      {#each reversed as item, i (item)}
        <div
          class={cn(
            'flex h-9 items-center justify-center rounded-md border font-mono text-sm font-semibold',
            i === 0
              ? 'border-node-frontier bg-node-frontier text-node-frontier-foreground'
              : 'border-border bg-secondary text-secondary-foreground',
          )}
        >
          {item}
        </div>
      {/each}
    </div>
  {/if}
</div>

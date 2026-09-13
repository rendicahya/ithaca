<script lang="ts">
  interface Props {
    entries: string[]
  }

  let { entries }: Props = $props()
  let scrollEl: HTMLDivElement | undefined = $state()

  $effect(() => {
    // Re-run whenever the number of entries changes; keep the latest decision in view.
    entries.length
    scrollEl?.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' })
  })
</script>

<div class="flex h-full flex-col">
  <div class="border-b border-border px-4 py-2">
    <h3 class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      Decision Trace
    </h3>
  </div>
  <div bind:this={scrollEl} class="min-h-0 flex-1 overflow-y-auto px-4 py-2 scrollbar-thin">
    {#if entries.length === 0}
      <p class="text-xs text-muted-foreground">No decisions yet.</p>
    {:else}
      <ol class="space-y-1 text-xs">
        {#each entries as entry, i (i)}
          <li class="flex gap-2 text-muted-foreground">
            <span class="w-5 shrink-0 text-right tabular-nums">{i + 1}.</span>
            <span class={i === entries.length - 1 ? 'font-medium text-foreground' : ''}>
              {entry}
            </span>
          </li>
        {/each}
      </ol>
    {/if}
  </div>
</div>

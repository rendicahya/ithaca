<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import type { BadgeVariant } from '@/components/ui/badge'
  import { cn } from '@/lib/utils'

  interface Props {
    id: string
    genes: number[]
    fitness: number
    /** False while the chromosome has not gone through an "evaluate fitness" step — the fitness value is hidden rather than shown prematurely. */
    evaluated?: boolean
    /** Binary chromosomes highlight 1-genes; non-binary encodings (e.g. permutations) just show the raw value. */
    binary?: boolean
    /** Per-gene index → which parent it came from, for crossover offspring rows. */
    originClass?: (index: number) => string
    mutatedIndices?: number[]
    ring?: 'parent' | 'best' | 'candidate' | null
    badgeVariant?: BadgeVariant
    selected?: boolean
    /** Clicking the row inspects this chromosome elsewhere (e.g. the illustration). Omit to make the row non-interactive. */
    onSelect?: () => void
  }

  let {
    id,
    genes,
    fitness,
    evaluated = true,
    binary = true,
    originClass,
    mutatedIndices = [],
    ring = null,
    badgeVariant = 'secondary',
    selected = false,
    onSelect,
  }: Props = $props()

  const mutatedSet = $derived(new Set(mutatedIndices))
</script>

<button
  type="button"
  disabled={!onSelect}
  onclick={onSelect}
  class={cn(
    'flex w-full items-center gap-2 rounded-md border border-transparent bg-transparent p-1 text-left',
    onSelect && 'cursor-pointer hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    ring === 'parent' && 'ring-2 ring-node-current',
    ring === 'best' && 'ring-2 ring-node-path',
    ring === 'candidate' && 'border-dashed border-muted-foreground/50',
    selected && 'bg-accent ring-2 ring-primary',
  )}
>
  <Badge variant={badgeVariant} class="w-9 shrink-0 justify-center font-mono">{id}</Badge>
  <div class="flex gap-1">
    {#each genes as gene, i (i)}
      <div
        class={cn(
          'flex size-6 items-center justify-center rounded border font-mono text-xs font-semibold',
          originClass
            ? cn('border-t-4', originClass(i))
            : binary && gene === 1
              ? 'border-border bg-primary text-primary-foreground'
              : 'border-border bg-muted text-muted-foreground',
          mutatedSet.has(i) && 'ring-2 ring-destructive',
        )}
      >
        {gene}
      </div>
    {/each}
  </div>
  <span class="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
    {#if evaluated}
      {fitness}
    {:else}
      ?
    {/if}
  </span>
</button>

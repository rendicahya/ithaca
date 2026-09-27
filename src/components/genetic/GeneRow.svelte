<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import type { BadgeVariant } from '@/components/ui/badge'
  import { cn } from '@/lib/utils'

  interface Props {
    id: string
    genes: number[]
    fitness: number
    maxFitness: number
    /** False while the chromosome has not gone through an "evaluate fitness" step — the fitness value is hidden rather than shown prematurely. */
    evaluated?: boolean
    /** Binary chromosomes highlight 1-genes; non-binary encodings (e.g. permutations) just show the raw value. */
    binary?: boolean
    /** Per-gene index → which parent it came from, for crossover offspring rows. */
    originClass?: (index: number) => string
    mutatedIndices?: number[]
    ring?: 'parent' | 'best' | 'candidate' | null
    badgeVariant?: BadgeVariant
  }

  let {
    id,
    genes,
    fitness,
    maxFitness,
    evaluated = true,
    binary = true,
    originClass,
    mutatedIndices = [],
    ring = null,
    badgeVariant = 'secondary',
  }: Props = $props()

  const mutatedSet = $derived(new Set(mutatedIndices))
</script>

<div
  class={cn(
    'flex items-center gap-2 rounded-md border border-transparent p-1',
    ring === 'parent' && 'ring-2 ring-node-current',
    ring === 'best' && 'ring-2 ring-node-path',
    ring === 'candidate' && 'border-dashed border-muted-foreground/50',
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
      {fitness}/{maxFitness}
    {:else}
      ?/{maxFitness}
    {/if}
  </span>
</div>

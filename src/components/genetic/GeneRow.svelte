<script lang="ts">
  import { Badge } from '@/components/ui/badge'
  import type { BadgeVariant } from '@/components/ui/badge'
  import { cn } from '@/lib/utils'

  interface Props {
    id: string
    genes: number[]
    fitness: number
    maxFitness: number
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
            : gene === 1
              ? 'border-border bg-primary text-primary-foreground'
              : 'border-border bg-muted text-muted-foreground',
          mutatedSet.has(i) && 'ring-2 ring-destructive',
        )}
      >
        {gene}
      </div>
    {/each}
  </div>
  <span class="ml-auto shrink-0 font-mono text-xs text-muted-foreground">{fitness}/{maxFitness}</span>
</div>

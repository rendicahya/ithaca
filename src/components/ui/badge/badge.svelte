<script lang="ts" module>
  import { type VariantProps, tv } from 'tailwind-variants'

  export const badgeVariants = tv({
    base: 'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  })

  export type BadgeVariant = VariantProps<typeof badgeVariants>['variant']
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'

  import { cn } from '@/lib/utils'

  interface Props {
    variant?: BadgeVariant
    class?: string
    children?: Snippet
  }

  let { variant = 'default', class: className, children }: Props = $props()
</script>

<span class={cn(badgeVariants({ variant }), className)}>
  {@render children?.()}
</span>

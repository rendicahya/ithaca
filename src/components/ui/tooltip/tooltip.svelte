<script lang="ts">
  import { Tooltip as TooltipPrimitive } from 'bits-ui'
  import type { Snippet } from 'svelte'

  import { cn } from '@/lib/utils'

  interface Props {
    text: string
    side?: 'top' | 'right' | 'bottom' | 'left'
    children: Snippet
  }

  let { text, side = 'top', children }: Props = $props()
</script>

<TooltipPrimitive.Provider delayDuration={200}>
  <TooltipPrimitive.Root>
    <TooltipPrimitive.Trigger>
      {@render children()}
    </TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content {side} sideOffset={6}>
        <div
          class={cn(
            'z-50 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-md',
          )}
        >
          {text}
        </div>
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>
</TooltipPrimitive.Provider>

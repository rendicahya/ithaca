<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui'
  import { X } from '@lucide/svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    open: boolean
    title: string
    description?: string
    children: Snippet
  }

  let { open = $bindable(false), title, description, children }: Props = $props()
</script>

<DialogPrimitive.Root bind:open>
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      class="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
    />
    <DialogPrimitive.Content
      class="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg"
    >
      <div class="mb-4 flex items-start justify-between gap-4">
        <div>
          <DialogPrimitive.Title class="text-base font-semibold">{title}</DialogPrimitive.Title>
          {#if description}
            <DialogPrimitive.Description class="mt-1 text-sm text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          {/if}
        </div>
        <DialogPrimitive.Close
          class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close"
        >
          <X class="size-4" />
        </DialogPrimitive.Close>
      </div>
      {@render children()}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
</DialogPrimitive.Root>

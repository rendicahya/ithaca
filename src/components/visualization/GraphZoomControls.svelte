<script lang="ts">
  import { Panel, useSvelteFlow } from '@xyflow/svelte'
  import { ZoomIn, ZoomOut } from '@lucide/svelte'

  import { Button } from '@/components/ui/button'
  import { Tooltip } from '@/components/ui/tooltip'

  const { zoomIn, zoomOut } = useSvelteFlow()
</script>

<Panel position="top-right" class="flex gap-1.5">
  <Tooltip text="Zoom Out">
    <Button
      variant="outline"
      size="icon"
      aria-label="Zoom out"
      class="bg-card"
      onclick={() => zoomOut({ duration: 150 })}
    >
      <ZoomOut class="size-4" />
    </Button>
  </Tooltip>
  <Tooltip text="Zoom In">
    <Button
      variant="outline"
      size="icon"
      aria-label="Zoom in"
      class="bg-card"
      onclick={() => zoomIn({ duration: 150 })}
    >
      <ZoomIn class="size-4" />
    </Button>
  </Tooltip>
</Panel>

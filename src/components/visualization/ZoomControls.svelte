<script lang="ts">
  import { ZoomIn, ZoomOut } from '@lucide/svelte'

  import { Button } from '@/components/ui/button'
  import { Tooltip } from '@/components/ui/tooltip'

  interface Props {
    zoom: number
    canZoomIn: boolean
    canZoomOut: boolean
    onZoomIn: () => void
    onZoomOut: () => void
    onReset: () => void
  }

  let { zoom, canZoomIn, canZoomOut, onZoomIn, onZoomOut, onReset }: Props = $props()
</script>

<div class="absolute right-2 top-2 z-10 flex items-center gap-1.5">
  <Tooltip text="Zoom Out">
    <Button
      variant="outline"
      size="icon"
      aria-label="Zoom out"
      class="bg-card"
      disabled={!canZoomOut}
      onclick={onZoomOut}
    >
      <ZoomOut class="size-4" />
    </Button>
  </Tooltip>
  <Tooltip text="Reset Zoom">
    <button
      type="button"
      aria-label="Reset zoom"
      class="min-w-12 rounded-md border border-border bg-card px-1.5 py-1 text-center font-mono text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      onclick={onReset}
    >
      {Math.round(zoom * 100)}%
    </button>
  </Tooltip>
  <Tooltip text="Zoom In">
    <Button
      variant="outline"
      size="icon"
      aria-label="Zoom in"
      class="bg-card"
      disabled={!canZoomIn}
      onclick={onZoomIn}
    >
      <ZoomIn class="size-4" />
    </Button>
  </Tooltip>
</div>

<script lang="ts">
  import { Maximize, Minimize } from '@lucide/svelte'

  import { Button } from '@/components/ui/button'
  import { Tooltip } from '@/components/ui/tooltip'
  import { fullscreenStore } from '@/lib/fullscreen.svelte'
</script>

<Tooltip text={fullscreenStore.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
  <Button variant="ghost" size="icon" aria-label="Toggle fullscreen" onclick={fullscreenStore.toggle}>
    {#if fullscreenStore.isFullscreen}
      <Minimize class="size-4" />
    {:else}
      <Maximize class="size-4" />
    {/if}
  </Button>
</Tooltip>

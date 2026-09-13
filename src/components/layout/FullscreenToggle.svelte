<script lang="ts">
  import { Maximize, Minimize } from '@lucide/svelte'

  import { Button } from '@/components/ui/button'
  import { Tooltip } from '@/components/ui/tooltip'
  import { fullscreenStore } from '@/lib/fullscreen.svelte'
  import { localeStore } from '@/lib/i18n/locale.svelte'
</script>

<Tooltip
  text={fullscreenStore.isFullscreen
    ? localeStore.t('fullscreen.exit')
    : localeStore.t('fullscreen.enter')}
>
  <Button
    variant="ghost"
    size="icon"
    aria-label={localeStore.t('fullscreen.toggleAria')}
    onclick={fullscreenStore.toggle}
  >
    {#if fullscreenStore.isFullscreen}
      <Minimize class="size-4" />
    {:else}
      <Maximize class="size-4" />
    {/if}
  </Button>
</Tooltip>

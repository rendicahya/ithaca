<script lang="ts">
  import { Moon, Sun } from '@lucide/svelte'

  import { Button } from '@/components/ui/button'
  import { Tooltip } from '@/components/ui/tooltip'
  import { themeStore } from '@/lib/theme/theme.svelte'
</script>

<Tooltip text={themeStore.theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}>
  <Button variant="ghost" size="icon" aria-label="Toggle theme" onclick={themeStore.toggle}>
    {#if themeStore.theme === 'light'}
      <Sun class="size-4" />
    {:else}
      <Moon class="size-4" />
    {/if}
  </Button>
</Tooltip>

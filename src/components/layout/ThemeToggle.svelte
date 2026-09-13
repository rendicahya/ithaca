<script lang="ts">
  import { Moon, Sun } from '@lucide/svelte'

  import { Button } from '@/components/ui/button'
  import { Tooltip } from '@/components/ui/tooltip'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { themeStore } from '@/lib/theme/theme.svelte'
</script>

<Tooltip
  text={themeStore.theme === 'light'
    ? localeStore.t('theme.toDark')
    : localeStore.t('theme.toLight')}
>
  <Button
    variant="ghost"
    size="icon"
    aria-label={localeStore.t('theme.toggleAria')}
    onclick={themeStore.toggle}
  >
    {#if themeStore.theme === 'light'}
      <Sun class="size-4" />
    {:else}
      <Moon class="size-4" />
    {/if}
  </Button>
</Tooltip>

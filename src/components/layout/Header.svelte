<script lang="ts">
  import { localeStore } from '@/lib/i18n/locale.svelte'

  import FullscreenToggle from './FullscreenToggle.svelte'
  import LanguageToggle from './LanguageToggle.svelte'
  import ThemeToggle from './ThemeToggle.svelte'
</script>

<div class="flex items-center justify-between px-4 py-2.5">
  <div class="flex items-baseline gap-2">
    <span class="text-base font-bold tracking-tight">{localeStore.t('app.title')}</span>
    <span class="hidden text-xs text-muted-foreground sm:inline">
      {localeStore.t('app.subtitle')}
    </span>
  </div>
  <div class="flex items-center gap-1">
    <LanguageToggle />
    <ThemeToggle />
    <FullscreenToggle />
  </div>
</div>

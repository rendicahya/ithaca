<script lang="ts">
  import { Languages } from '@lucide/svelte'

  import { Button } from '@/components/ui/button'
  import { Tooltip } from '@/components/ui/tooltip'
  import { localeStore } from '@/lib/i18n/locale.svelte'
</script>

<Tooltip
  text={localeStore.locale === 'en'
    ? localeStore.t('language.toIndonesian')
    : localeStore.t('language.toEnglish')}
>
  <Button
    variant="ghost"
    size="sm"
    class="gap-1.5 px-2"
    aria-label={localeStore.t('language.toggleAria')}
    onclick={localeStore.toggle}
  >
    <Languages class="size-4" />
    <span class="font-mono text-xs font-semibold uppercase">{localeStore.locale}</span>
  </Button>
</Tooltip>

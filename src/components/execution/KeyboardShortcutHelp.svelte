<script lang="ts">
  import { Dialog } from '@/components/ui/dialog'
  import { localeStore } from '@/lib/i18n/locale.svelte'

  interface Props {
    open: boolean
  }

  let { open = $bindable(false) }: Props = $props()

  const shortcuts: [string, string][] = [
    ['Page Down / →', 'shortcuts.stepForward'],
    ['Page Up / ←', 'shortcuts.stepBackward'],
    ['Space', 'shortcuts.runPause'],
    ['R', 'shortcuts.reset'],
    ['?', 'shortcuts.showShortcuts'],
    ['Esc', 'shortcuts.closeExit'],
  ]
</script>

<Dialog
  bind:open
  title={localeStore.t('shortcuts.title')}
  description={localeStore.t('shortcuts.description')}
>
  <dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">
    {#each shortcuts as [key, actionKey] (key)}
      <dt class="text-muted-foreground">{localeStore.t(actionKey)}</dt>
      <dd class="justify-self-end">
        <kbd class="rounded border border-border bg-secondary px-2 py-1 font-mono text-xs font-medium">
          {key}
        </kbd>
      </dd>
    {/each}
  </dl>
</Dialog>

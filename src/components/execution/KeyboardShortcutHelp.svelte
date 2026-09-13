<script lang="ts">
  import { Dialog } from '@/components/ui/dialog'

  interface Props {
    open: boolean
  }

  let { open = $bindable(false) }: Props = $props()

  const shortcuts: [string, string][] = [
    ['Page Down / →', 'Step Forward'],
    ['Page Up / ←', 'Step Backward'],
    ['Space', 'Run / Pause'],
    ['R', 'Reset'],
    ['?', 'Show Shortcuts'],
    ['Esc', 'Close / Exit Fullscreen'],
  ]
</script>

<Dialog bind:open title="Keyboard Shortcuts" description="Works from anywhere, including fullscreen presentation mode.">
  <dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">
    {#each shortcuts as [key, action] (key)}
      <dt class="text-muted-foreground">{action}</dt>
      <dd class="justify-self-end">
        <kbd class="rounded border border-border bg-secondary px-2 py-1 font-mono text-xs font-medium">
          {key}
        </kbd>
      </dd>
    {/each}
  </dl>
</Dialog>

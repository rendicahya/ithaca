<script lang="ts">
  import { ChevronDown, ChevronUp } from '@lucide/svelte'

  import { Button } from '@/components/ui/button'
  import { Tooltip } from '@/components/ui/tooltip'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { msg } from '@/lib/i18n/translate'
  import { cn } from '@/lib/utils'

  interface Props {
    lines: string[]
    activeLine: number
    title: string
    visible: boolean
    onToggleVisible: () => void
  }

  let { lines, activeLine, title, visible, onToggleVisible }: Props = $props()
</script>

<div class="flex h-full flex-col">
  <div class="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
    <h3 class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {localeStore.t(msg('pseudocode.title', { title }))}
    </h3>
    <Tooltip
      text={visible
        ? localeStore.t('pseudocode.hideTooltip')
        : localeStore.t('pseudocode.showTooltip')}
    >
      <Button
        variant="ghost"
        size="sm"
        class="h-6 gap-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
        aria-label={visible
          ? localeStore.t('pseudocode.hideTooltip')
          : localeStore.t('pseudocode.showTooltip')}
        aria-expanded={visible}
        onclick={onToggleVisible}
      >
        {visible ? localeStore.t('pseudocode.hide') : localeStore.t('pseudocode.show')}
        {#if visible}
          <ChevronDown class="size-3.5" />
        {:else}
          <ChevronUp class="size-3.5" />
        {/if}
      </Button>
    </Tooltip>
  </div>
  {#if visible}
    <div class="min-h-0 flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
      <ol class="font-mono text-[13px] leading-6">
        {#each lines as line, i (i)}
          {@const lineNumber = i + 1}
          <li
            class={cn(
              'flex gap-3 rounded px-2 py-0.5 transition-colors duration-150',
              lineNumber === activeLine && 'bg-accent',
            )}
          >
            <span
              class={cn(
                'w-5 shrink-0 select-none text-right tabular-nums',
                lineNumber === activeLine
                  ? 'text-accent-foreground/70'
                  : 'text-muted-foreground/60',
              )}
            >
              {lineNumber}
            </span>
            <span
              class={cn(
                'whitespace-pre',
                lineNumber === activeLine
                  ? 'font-semibold text-accent-foreground'
                  : 'text-foreground/90',
              )}
            >
              {line}
            </span>
          </li>
        {/each}
      </ol>
    </div>
  {/if}
</div>

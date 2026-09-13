<script lang="ts">
  import { Keyboard, Pause, Play, RotateCcw, SkipBack, SkipForward } from '@lucide/svelte'

  import { Button } from '@/components/ui/button'
  import { Tooltip } from '@/components/ui/tooltip'
  import type { PlaybackController } from '@/lib/execution/controller.svelte'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { msg } from '@/lib/i18n/translate'

  interface Props {
    controller: PlaybackController
    onShowHelp: () => void
  }

  let { controller, onShowHelp }: Props = $props()
</script>

<div class="flex flex-wrap items-center gap-3 border-t border-border bg-card px-4 py-2.5">
  <div class="flex items-center gap-1.5">
    <Tooltip text={localeStore.t('controls.stepBackwardTooltip')}>
      <Button
        variant="outline"
        size="icon"
        aria-label={localeStore.t('controls.stepBackwardAria')}
        disabled={controller.isAtStart}
        onclick={controller.stepBackward}
      >
        <SkipBack class="size-4" />
      </Button>
    </Tooltip>

    <Tooltip
      text={controller.isRunning
        ? localeStore.t('controls.pauseTooltip')
        : localeStore.t('controls.runTooltip')}
    >
      <Button
        variant="default"
        size="icon"
        aria-label={controller.isRunning
          ? localeStore.t('controls.pauseAria')
          : localeStore.t('controls.runAria')}
        disabled={controller.isAtEnd && !controller.isRunning}
        onclick={controller.toggleRun}
      >
        {#if controller.isRunning}
          <Pause class="size-4" />
        {:else}
          <Play class="size-4" />
        {/if}
      </Button>
    </Tooltip>

    <Tooltip text={localeStore.t('controls.stepForwardTooltip')}>
      <Button
        variant="outline"
        size="icon"
        aria-label={localeStore.t('controls.stepForwardAria')}
        disabled={controller.isAtEnd}
        onclick={controller.stepForward}
      >
        <SkipForward class="size-4" />
      </Button>
    </Tooltip>

    <Tooltip text={localeStore.t('controls.resetTooltip')}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={localeStore.t('controls.resetAria')}
        onclick={controller.reset}
      >
        <RotateCcw class="size-4" />
      </Button>
    </Tooltip>
  </div>

  <div class="font-mono text-xs text-muted-foreground">
    {localeStore.t(
      msg('controls.stepProgress', {
        current: controller.progress.current,
        total: controller.progress.total,
      }),
    )}
  </div>

  <div class="ml-auto flex items-center gap-3">
    <label class="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{localeStore.t('controls.speed')}</span>
      <input
        type="range"
        min="250"
        max="2500"
        step="250"
        value={2750 - controller.speedMs}
        oninput={(e) => (controller.speedMs = 2750 - Number(e.currentTarget.value))}
        class="h-1.5 w-28 cursor-pointer accent-primary"
        aria-label={localeStore.t('controls.speed')}
      />
    </label>

    <Tooltip text={localeStore.t('controls.shortcutsTooltip')}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={localeStore.t('controls.shortcutsAria')}
        onclick={onShowHelp}
      >
        <Keyboard class="size-4" />
      </Button>
    </Tooltip>
  </div>
</div>

<script lang="ts">
  import { Keyboard, Pause, Play, RotateCcw, SkipBack, SkipForward } from '@lucide/svelte'

  import { Button } from '@/components/ui/button'
  import { Tooltip } from '@/components/ui/tooltip'
  import type { ExecutionController } from '@/lib/execution/controller.svelte'

  interface Props {
    controller: ExecutionController
    onShowHelp: () => void
  }

  let { controller, onShowHelp }: Props = $props()
</script>

<div class="flex flex-wrap items-center gap-3 border-t border-border bg-card px-4 py-2.5">
  <div class="flex items-center gap-1.5">
    <Tooltip text="Step Backward (Page Up / ←)">
      <Button
        variant="outline"
        size="icon"
        aria-label="Step backward"
        disabled={controller.isAtStart}
        onclick={controller.stepBackward}
      >
        <SkipBack class="size-4" />
      </Button>
    </Tooltip>

    <Tooltip text={controller.isRunning ? 'Pause (Space)' : 'Run (Space)'}>
      <Button
        variant="default"
        size="icon"
        aria-label={controller.isRunning ? 'Pause' : 'Run'}
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

    <Tooltip text="Step Forward (Page Down / →)">
      <Button
        variant="outline"
        size="icon"
        aria-label="Step forward"
        disabled={controller.isAtEnd}
        onclick={controller.stepForward}
      >
        <SkipForward class="size-4" />
      </Button>
    </Tooltip>

    <Tooltip text="Reset (R)">
      <Button variant="ghost" size="icon" aria-label="Reset" onclick={controller.reset}>
        <RotateCcw class="size-4" />
      </Button>
    </Tooltip>
  </div>

  <div class="font-mono text-xs text-muted-foreground">
    Step {controller.progress.current} / {controller.progress.total}
  </div>

  <div class="ml-auto flex items-center gap-3">
    <label class="flex items-center gap-2 text-xs text-muted-foreground">
      <span>Speed</span>
      <input
        type="range"
        min="250"
        max="2500"
        step="250"
        value={2750 - controller.speedMs}
        oninput={(e) => (controller.speedMs = 2750 - Number(e.currentTarget.value))}
        class="h-1.5 w-28 cursor-pointer accent-primary"
        aria-label="Playback speed"
      />
    </label>

    <Tooltip text="Keyboard Shortcuts (?)">
      <Button variant="ghost" size="icon" aria-label="Show keyboard shortcuts" onclick={onShowHelp}>
        <Keyboard class="size-4" />
      </Button>
    </Tooltip>
  </div>
</div>

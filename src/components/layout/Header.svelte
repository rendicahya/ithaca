<script lang="ts">
  import FullscreenToggle from './FullscreenToggle.svelte'
  import ThemeToggle from './ThemeToggle.svelte'
</script>

<div class="flex items-center justify-between px-4 py-2.5">
  <div class="flex items-baseline gap-2">
    <span class="text-base font-bold tracking-tight">Ithaca</span>
    <span class="hidden text-xs text-muted-foreground sm:inline"
      >AI Teaching Environment</span
    >
  </div>
  <div class="flex items-center gap-1">
    <ThemeToggle />
    <FullscreenToggle />
  </div>
</div>

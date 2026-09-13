<script lang="ts">
  interface Props {
    text: string
    current: number
    total: number
  }

  let { text, current, total }: Props = $props()
</script>

<div class="flex items-start gap-3 border-b border-border bg-card px-4 py-3">
  <span
    class="mt-0.5 shrink-0 rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-semibold text-primary-foreground"
  >
    {current}/{total}
  </span>
  <p class="text-sm leading-snug text-foreground">{text}</p>
</div>

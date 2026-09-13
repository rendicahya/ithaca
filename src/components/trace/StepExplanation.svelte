<script lang="ts">
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import type { Message } from '@/lib/i18n/translate'

  interface Props {
    message: Message
    current: number
    total: number
  }

  let { message, current, total }: Props = $props()
</script>

<div class="flex items-start gap-3 border-b border-border bg-card px-4 py-3">
  <span
    class="mt-0.5 shrink-0 rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-semibold text-primary-foreground"
  >
    {current}/{total}
  </span>
  <p class="text-sm leading-snug text-foreground">{localeStore.t(message)}</p>
</div>

<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    header: Snippet
    nav: Snippet
    explanation: Snippet
    main: Snippet
    panel: Snippet
    pseudocode: Snippet
    controls: Snippet
    pseudocodeVisible: boolean
  }

  let { header, nav, explanation, main, panel, pseudocode, controls, pseudocodeVisible }: Props =
    $props()
</script>

<div
  class="grid h-screen overflow-hidden bg-background transition-[grid-template-rows] duration-200"
  style={`grid-template-rows: auto 1fr ${pseudocodeVisible ? '220px' : '37px'} auto`}
>
  <header class="border-b border-border">
    {@render header()}
  </header>

  <div class="grid grid-cols-[220px_1fr_280px] overflow-hidden">
    <nav class="overflow-hidden border-r border-border">
      {@render nav()}
    </nav>

    <div class="flex min-w-0 flex-col overflow-hidden">
      {@render explanation()}
      <main class="min-h-0 flex-1">
        {@render main()}
      </main>
    </div>

    <aside class="overflow-hidden border-l border-border">
      {@render panel()}
    </aside>
  </div>

  <section class="overflow-hidden border-t border-border">
    {@render pseudocode()}
  </section>

  <footer class="overflow-hidden">
    {@render controls()}
  </footer>
</div>

<script lang="ts">
  import { MousePointerClick } from '@lucide/svelte'

  import { componentIcons, componentKey, diagramBoxes, diagramEdges, subcomponentKey, subcomponents } from '@/lib/algorithms/esArchitecture'
  import type { ArchState, ComponentId, DiagramBox } from '@/lib/algorithms/esArchitecture'
  import { localeStore } from '@/lib/i18n/locale.svelte'
  import { cn } from '@/lib/utils'

  interface Props {
    state: ArchState
    selected: ComponentId | null
    onSelect: (id: ComponentId) => void
  }

  let { state, selected, onSelect }: Props = $props()

  /** Greedy word wrap — SVG text has no automatic line breaking. */
  function wrap(text: string, maxChars: number): string[] {
    const lines: string[] = []
    let line = ''
    for (const word of text.split(' ')) {
      if (line && (line + ' ' + word).length > maxChars) {
        lines.push(line)
        line = word
      } else {
        line = line ? `${line} ${word}` : word
      }
    }
    if (line) lines.push(line)
    return lines
  }

  const NAME_SIZE = 15
  const SUB_SIZE = 12.5
  const ICON_SCALE = 1.6
  // The icon sits left of a box's name; the name is centred in the remaining width.
  const ICON_GAP = 6

  function handleKey(event: KeyboardEvent, id: ComponentId): void {
    if (event.key !== 'Enter' && event.key !== ' ') return
    // Space would otherwise also reach the global Run/Pause shortcut.
    event.preventDefault()
    event.stopPropagation()
    onSelect(id)
  }

  function points(p: [number, number][]): string {
    return p.map(([x, y]) => `${x},${y}`).join(' ')
  }

  function isActive(id: ComponentId): boolean {
    return state.activeComponents.includes(id)
  }
</script>

{#snippet boxContent(box: DiagramBox)}
  {@const name = localeStore.t(componentKey(box.id, 'name'))}
  {@const subs = subcomponents[box.id] ?? []}
  {#if box.shape === 'heading'}
    <text
      x={box.x + box.w / 2}
      y={box.y + box.h / 2 + 6}
      text-anchor="middle"
      class={cn('text-[17px] font-bold uppercase tracking-wide', isActive(box.id) ? 'fill-node-current' : 'fill-foreground')}
    >
      {name}
    </text>
    <line
      x1={box.x + 40}
      x2={box.x + box.w - 40}
      y1={box.y + box.h - 2}
      y2={box.y + box.h - 2}
      class={cn(isActive(box.id) ? 'stroke-node-current' : 'stroke-border')}
      stroke-width="2"
    />
  {:else}
    {@const fontSize = box.shape === 'chip' ? 12.5 : NAME_SIZE}
    {@const icon = componentIcons[box.id]}
    {@const iconSize = fontSize * ICON_SCALE}
    {@const iconSpace = icon ? iconSize + ICON_GAP : 0}
    {@const nameLines = wrap(name, Math.floor((box.w - iconSpace) / (fontSize * 0.58)))}
    {@const lineHeight = fontSize + 3}
    {@const subLineHeight = SUB_SIZE + 4}
    {@const blockHeight = nameLines.length * lineHeight + subs.length * subLineHeight + (subs.length ? 6 : 0)}
    {@const top = box.y + (box.h - blockHeight) / 2 + fontSize}
    {@const nameX = box.x + box.w / 2 + iconSpace / 2}
    {@const nameWidth = Math.max(...nameLines.map((l) => l.length)) * fontSize * 0.6}
    <rect
      class={cn(
        'box-frame transition-colors',
        isActive(box.id) ? 'fill-node-current/15 stroke-node-current' : 'fill-card stroke-muted-foreground/60',
        box.shape === 'chip' && !isActive(box.id) && 'fill-muted',
      )}
      x={box.x}
      y={box.y}
      width={box.w}
      height={box.h}
      rx={box.shape === 'pill' ? box.h / 2 : box.shape === 'chip' ? 8 : 6}
      stroke-width={state.focus === box.id ? 3.5 : isActive(box.id) ? 2.5 : 1.5}
      stroke-dasharray={box.shape === 'chip' ? '5 3' : undefined}
    />
    {#if icon}
      <text
        x={nameX - nameWidth / 2 - ICON_GAP - iconSize / 2}
        y={top - fontSize * 0.35 + ((nameLines.length - 1) * lineHeight) / 2}
        text-anchor="middle"
        dominant-baseline="central"
        font-size={iconSize}
        aria-hidden="true"
      >
        {icon}
      </text>
    {/if}
    {#each nameLines as line, i (i)}
      <text
        x={nameX}
        y={top + i * lineHeight}
        text-anchor="middle"
        class="fill-foreground font-semibold"
        font-size={fontSize}
      >
        {line}
      </text>
    {/each}
    {#each subs as sub, i (sub)}
      <text
        x={box.x + box.w / 2}
        y={top + nameLines.length * lineHeight + 4 + i * subLineHeight}
        text-anchor="middle"
        class="fill-muted-foreground"
        font-size={SUB_SIZE}
      >
        {localeStore.t(subcomponentKey(box.id, sub, 'name'))}
      </text>
    {/each}
  {/if}

  {#if selected === box.id}
    <rect
      x={box.x - 6}
      y={box.y - 6}
      width={box.w + 12}
      height={box.h + 12}
      rx="10"
      fill="none"
      class="stroke-primary"
      stroke-width="2"
      stroke-dasharray="6 4"
    />
  {/if}

  {#if state.firstVisit[box.id] !== undefined}
    <g aria-hidden="true">
      <circle cx={box.x + box.w - 2} cy={box.y + 2} r="13" class="fill-primary" />
      <text
        x={box.x + box.w - 2}
        y={box.y + 7}
        text-anchor="middle"
        class="fill-primary-foreground font-mono text-[13px] font-bold"
      >
        {state.firstVisit[box.id]}
      </text>
    </g>
  {/if}
{/snippet}

<div class="flex h-full flex-col gap-2 p-4">
  <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
    <h2 class="text-lg font-semibold tracking-tight">{localeStore.t('esArch.title')}</h2>
    <p class="flex items-center gap-1.5 text-sm text-muted-foreground">
      <MousePointerClick class="size-4 shrink-0" />
      {localeStore.t('esArch.hint')}
    </p>
  </div>

  <svg
    viewBox="0 0 1000 620"
    preserveAspectRatio="xMidYMid meet"
    class="min-h-0 w-full flex-1 select-none"
    role="group"
    aria-label={localeStore.t('esArch.title')}
  >
    <defs>
      <marker id="arch-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" class="fill-muted-foreground" />
      </marker>
      <marker id="arch-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" class="fill-node-current" />
      </marker>
    </defs>

    <line x1="500" y1="52" x2="500" y2="575" class="stroke-border" stroke-width="2" stroke-dasharray="8 6" />

    {#each diagramEdges as edge (edge.id)}
      {@const active = state.activeEdges.includes(edge.id)}
      {@const marker = active ? 'url(#arch-arrow-active)' : 'url(#arch-arrow)'}
      <polyline
        points={points(edge.points)}
        fill="none"
        class={cn('transition-colors', active ? 'stroke-node-current' : 'stroke-muted-foreground')}
        stroke-width={active ? 3.5 : 1.5}
        stroke-dasharray={edge.dashed ? '6 5' : undefined}
        marker-end={marker}
        marker-start={edge.bidirectional ? marker : undefined}
      />
    {/each}

    <text x="135" y="134" class="fill-muted-foreground italic" font-size="12.5">
      {#each wrap(localeStore.t('esArch.factsLabel'), 20) as line, i (i)}
        <tspan x="135" dy={i === 0 ? 0 : 15}>{line}</tspan>
      {/each}
    </text>

    {#each diagramBoxes as box (box.id)}
      <g
        role="button"
        tabindex="0"
        aria-label={localeStore.t(componentKey(box.id, 'name'))}
        aria-pressed={selected === box.id}
        class="cursor-pointer outline-none focus-visible:[&_.box-frame]:stroke-ring [&:hover_.box-frame]:stroke-primary"
        onclick={() => onSelect(box.id)}
        onkeydown={(e) => handleKey(e, box.id)}
      >
        {@render boxContent(box)}
      </g>
    {/each}
  </svg>
</div>

import type { RiskLevel } from '@/lib/algorithms/expertSystem'

/**
 * The scorecard's own red / yellow / green columns, mapped onto Ithaca's
 * semantic tokens so contrast holds in both themes. Every use is paired
 * with the level's text label, so color is never the only cue.
 */
export const levelHeaderClass: Record<RiskLevel, string> = {
  high: 'bg-destructive text-destructive-foreground',
  caution: 'bg-node-frontier text-node-frontier-foreground',
  low: 'bg-node-goal text-node-goal-foreground',
}

export const levelTintClass: Record<RiskLevel, string> = {
  high: 'bg-destructive/15',
  caution: 'bg-node-frontier/25',
  low: 'bg-node-goal/15',
}

export const levelBorderClass: Record<RiskLevel, string> = {
  high: 'border-destructive',
  caution: 'border-node-frontier',
  low: 'border-node-goal',
}

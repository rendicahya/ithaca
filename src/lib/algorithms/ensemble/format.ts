import { formatLabel } from './models'
import type { Stump } from './models'

/** Trims trailing zeros: 5 → "5", 1.75 → "1.75". */
export function formatNumber(value: number, digits = 2): string {
  return String(Number(value.toFixed(digits)))
}

/** e.g. "x ≤ 5 → +1" (the other side of the split is implicitly the other class). */
export function formatStump(stump: Stump): string {
  return `${stump.feature} ≤ ${formatNumber(stump.threshold)} → ${formatLabel(stump.below)}`
}

export interface LabeledPoint {
  id: string
  x: number
  y: number
  label: 0 | 1
}

/**
 * A small, cleanly (but not trivially) separable 2D dataset. Fixed and
 * hand-picked rather than random, per CLAUDE.md's determinism rules.
 */
export const logRegDataset: LabeledPoint[] = [
  { id: 'P1', x: 1, y: 1, label: 0 },
  { id: 'P2', x: 2, y: 1.5, label: 0 },
  { id: 'P3', x: 1.5, y: 3, label: 0 },
  { id: 'P4', x: 2, y: 0.5, label: 0 },
  { id: 'P5', x: 2, y: 2.5, label: 0 },
  { id: 'P6', x: 1, y: 4, label: 0 },
  { id: 'P7', x: 5, y: 5, label: 1 },
  { id: 'P8', x: 6, y: 4, label: 1 },
  { id: 'P9', x: 4, y: 6, label: 1 },
  { id: 'P10', x: 6, y: 6, label: 1 },
  { id: 'P11', x: 5, y: 3.5, label: 1 },
  { id: 'P12', x: 7, y: 5, label: 1 },
]

export const BOUNDS = { min: 0, max: 8 }
export const LEARNING_RATE = 0.28
export const MAX_EPOCHS = 35

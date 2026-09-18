export interface Point2D {
  id: string
  x: number
  y: number
}

/**
 * Fixed points roughly on the line y ≈ 2.1x + 3, with small deviations so
 * the fitted line visibly doesn't pass through every point — otherwise the
 * demo would look the same at every learning rate.
 */
export const linRegDataset: Point2D[] = [
  { id: 'P1', x: 1, y: 5 },
  { id: 'P2', x: 2, y: 7.5 },
  { id: 'P3', x: 3, y: 9 },
  { id: 'P4', x: 4, y: 12 },
  { id: 'P5', x: 5, y: 14 },
  { id: 'P6', x: 6, y: 15.5 },
  { id: 'P7', x: 7, y: 18 },
  { id: 'P8', x: 8, y: 19 },
  { id: 'P9', x: 9, y: 22 },
  { id: 'P10', x: 10, y: 24 },
]

export const BOUNDS_X = { min: 0, max: 11 }
export const BOUNDS_Y = { min: 0, max: 26 }
export const LEARNING_RATE = 0.02
export const MAX_EPOCHS = 20

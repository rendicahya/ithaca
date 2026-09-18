export interface DataPoint {
  id: string
  x: number
  y: number
  label: string
}

export const classNames = ['A', 'B'] as const
export type ClassName = (typeof classNames)[number]

/**
 * A small synthetic 2D dataset — two visually separated clusters with a
 * query point placed close to the boundary, so the nearest neighbors are a
 * genuine 2-1 majority rather than a unanimous (and less instructive) vote.
 */
export const knnDataset: DataPoint[] = [
  { id: 'A1', x: 2.5, y: 3.0, label: 'A' },
  { id: 'A2', x: 3.0, y: 6.5, label: 'A' },
  { id: 'A3', x: 4.0, y: 2.0, label: 'A' },
  { id: 'A4', x: 1.0, y: 5.0, label: 'A' },
  { id: 'A5', x: 5.5, y: 4.0, label: 'A' },
  { id: 'B1', x: 8.0, y: 7.5, label: 'B' },
  { id: 'B2', x: 7.0, y: 4.5, label: 'B' },
  { id: 'B3', x: 9.0, y: 6.0, label: 'B' },
  { id: 'B4', x: 6.5, y: 8.0, label: 'B' },
  { id: 'B5', x: 8.5, y: 3.0, label: 'B' },
]

export const knnQuery = { x: 5, y: 5 }
export const K = 3
export const BOUNDS = { min: 0, max: 10 }

export interface RawPoint {
  id: string
  x: number
  y: number
}

/** Three visually separated groups of 5 points each. */
export const kmeansDataset: RawPoint[] = [
  { id: 'P1', x: 1, y: 2 },
  { id: 'P2', x: 2, y: 1 },
  { id: 'P3', x: 2, y: 3 },
  { id: 'P4', x: 3, y: 2 },
  { id: 'P5', x: 1, y: 1 },
  { id: 'P6', x: 7, y: 2 },
  { id: 'P7', x: 8, y: 1 },
  { id: 'P8', x: 9, y: 3 },
  { id: 'P9', x: 8, y: 3 },
  { id: 'P10', x: 9, y: 1 },
  { id: 'P11', x: 4, y: 8 },
  { id: 'P12', x: 5, y: 9 },
  { id: 'P13', x: 6, y: 8 },
  { id: 'P14', x: 5, y: 7 },
  { id: 'P15', x: 6, y: 9 },
]

/**
 * Deliberately off-target starting positions (not aligned with any true
 * cluster) so the centroids visibly travel to find the three groups above,
 * rather than starting there.
 */
export const initialCentroids = [
  { x: 3, y: 5 },
  { x: 7, y: 5 },
  { x: 5, y: 2 },
]

export const K = initialCentroids.length
export const MAX_ITERATIONS = 6
export const BOUNDS = { min: 0, max: 10 }

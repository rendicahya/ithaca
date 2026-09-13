import { defaultGraph } from './defaultGraph'
import { treeGraph } from './treeGraph'
import type { Graph } from './types'

export interface GraphExample {
  id: 'weighted' | 'tree'
  graph: Graph
}

export const graphExamples: GraphExample[] = [
  { id: 'weighted', graph: defaultGraph },
  { id: 'tree', graph: treeGraph },
]

export function getGraphExample(id: GraphExample['id']): GraphExample {
  const example = graphExamples.find((g) => g.id === id)
  if (!example) throw new Error(`Unknown graph example: ${id}`)
  return example
}

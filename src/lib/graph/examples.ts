import { defaultGraph } from './defaultGraph'
import { treeGraph } from './treeGraph'
import type { Graph } from './types'

export interface GraphExample {
  id: 'weighted' | 'tree'
  name: string
  shortDescription: string
  graph: Graph
}

export const graphExamples: GraphExample[] = [
  {
    id: 'weighted',
    name: 'Weighted Graph',
    shortDescription: 'Multiple paths with different costs — contrasts all five algorithms.',
    graph: defaultGraph,
  },
  {
    id: 'tree',
    name: 'Tree',
    shortDescription: 'One path per node — isolates BFS and DFS traversal order.',
    graph: treeGraph,
  },
]

export function getGraphExample(id: GraphExample['id']): GraphExample {
  const example = graphExamples.find((g) => g.id === id)
  if (!example) throw new Error(`Unknown graph example: ${id}`)
  return example
}

import { defaultGraph } from './defaultGraph'
import { treeGraph } from './treeGraph'
import { emptyGraph } from './types'
import type { Graph } from './types'

export interface GraphExample {
  id: 'weighted' | 'tree' | 'custom'
  graph: Graph
}

export const graphExamples: GraphExample[] = [
  { id: 'weighted', graph: defaultGraph },
  { id: 'tree', graph: treeGraph },
  // The actual graph for 'custom' is never read from here — it's a
  // placeholder so the sidebar can list it. App.svelte reads the live graph
  // from customGraphStore instead, since it's user-editable and reactive.
  { id: 'custom', graph: emptyGraph() },
]

export function getGraphExample(id: GraphExample['id']): GraphExample {
  const example = graphExamples.find((g) => g.id === id)
  if (!example) throw new Error(`Unknown graph example: ${id}`)
  return example
}

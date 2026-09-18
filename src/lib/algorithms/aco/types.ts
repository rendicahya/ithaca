import type { Message } from '@/lib/i18n/translate'
import type { NodeId } from '@/lib/graph/types'

export interface AntPath {
  id: string
  /** Nodes visited so far, in order — starts with the graph's start node. */
  nodes: NodeId[]
  /** Edge ids traversed so far, in the same order as the moves between `nodes`. */
  edges: string[]
  cost: number
  /** True once the ant has reached the goal. */
  reachedGoal: boolean
}

/** A candidate edge considered at the ant's current decision point, shown in the state panel. */
export interface EdgeCandidate {
  edgeId: string
  targetId: NodeId
  pheromone: number
  heuristic: number
  probability: number
}

export interface ACOState {
  iteration: number
  maxIterations: number
  alpha: number
  beta: number
  evaporationRate: number
  depositFactor: number
  /** Pheromone level τ(e) keyed by edge id. */
  pheromone: Record<string, number>
  /** Ants built so far in the current iteration (completed and in-progress). */
  ants: AntPath[]
  currentAntId: string | null
  /** Candidates considered at the most recent decision point, or null between decisions. */
  candidates: EdgeCandidate[] | null
  iterationBestPath: NodeId[] | null
  iterationBestCost: number | null
  globalBestPath: NodeId[] | null
  globalBestCost: number | null
  done: boolean
}

export interface ACOStep {
  state: ACOState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
}

export function cloneAnt(ant: AntPath): AntPath {
  return { id: ant.id, nodes: [...ant.nodes], edges: [...ant.edges], cost: ant.cost, reachedGoal: ant.reachedGoal }
}

export function cloneState(state: ACOState): ACOState {
  return {
    ...state,
    pheromone: { ...state.pheromone },
    ants: state.ants.map(cloneAnt),
    candidates: state.candidates ? state.candidates.map((c) => ({ ...c })) : null,
    iterationBestPath: state.iterationBestPath ? [...state.iterationBestPath] : null,
    globalBestPath: state.globalBestPath ? [...state.globalBestPath] : null,
  }
}

export function pathToString(nodes: NodeId[]): string {
  return nodes.join(' → ')
}

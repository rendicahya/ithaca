import type { Message } from '@/lib/i18n/translate'

export type Action = 'up' | 'down' | 'left' | 'right'

export const actions: Action[] = ['up', 'down', 'left', 'right']

export type QTable = Record<string, Record<Action, number>>

export interface QLearningState {
  episode: number
  maxEpisodes: number
  episodeStep: number
  maxStepsPerEpisode: number
  epsilon: number
  alpha: number
  gamma: number
  qTable: QTable
  agentPos: { x: number; y: number }
  lastAction: Action | null
  wasExploration: boolean | null
  lastReward: number | null
  episodeOutcome: 'goal' | 'trap' | 'timeout' | null
  done: boolean
}

export interface QLearningStep {
  state: QLearningState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
}

export function cellKey(pos: { x: number; y: number }): string {
  return `${pos.x},${pos.y}`
}

export function cloneQTable(table: QTable): QTable {
  const clone: QTable = {}
  for (const [key, values] of Object.entries(table)) clone[key] = { ...values }
  return clone
}

export function cloneState(state: QLearningState): QLearningState {
  return {
    ...state,
    qTable: cloneQTable(state.qTable),
    agentPos: { ...state.agentPos },
  }
}

export function bestAction(qValues: Record<Action, number>): Action {
  let best = actions[0]
  let bestValue = -Infinity
  for (const action of actions) {
    if (qValues[action] > bestValue) {
      bestValue = qValues[action]
      best = action
    }
  }
  return best
}

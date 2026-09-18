export {
  ALPHA,
  EPSILON_DECAY,
  EPSILON_START,
  GAMMA,
  GOAL,
  grid,
  HEIGHT,
  MAX_EPISODES,
  MAX_STEPS_PER_EPISODE,
  START,
  TRAP,
  WALL,
  WIDTH,
} from './dataset'
export type { Cell, CellType } from './dataset'
export { qLearningPseudocode, runQLearning } from './qlearning'
export { actions, bestAction, cellKey } from './types'
export type { Action, QLearningState, QLearningStep, QTable } from './types'

export type CellType = 'normal' | 'wall' | 'goal' | 'trap' | 'start'

export interface Cell {
  x: number
  y: number
  type: CellType
}

/**
 * The classic Russell & Norvig 4x3 grid world — the standard textbook MDP
 * example. Transitions here are deliberately deterministic (no slip
 * probability) to keep the demo's randomness limited to the exploration
 * policy, per CLAUDE.md's determinism rules.
 */
export const WIDTH = 4
export const HEIGHT = 3
export const START = { x: 0, y: 2 }
export const GOAL = { x: 3, y: 0 }
export const TRAP = { x: 3, y: 1 }
export const WALL = { x: 1, y: 1 }

export const GOAL_REWARD = 10
export const TRAP_REWARD = -10
export const STEP_REWARD = -1

export const ALPHA = 0.5
export const GAMMA = 0.9
export const EPSILON_START = 0.9
export const EPSILON_DECAY = 0.8
export const MAX_EPISODES = 12
export const MAX_STEPS_PER_EPISODE = 12
export const SEED = 7

export function cellType(x: number, y: number): CellType {
  if (x === WALL.x && y === WALL.y) return 'wall'
  if (x === GOAL.x && y === GOAL.y) return 'goal'
  if (x === TRAP.x && y === TRAP.y) return 'trap'
  if (x === START.x && y === START.y) return 'start'
  return 'normal'
}

export const grid: Cell[] = Array.from({ length: WIDTH * HEIGHT }, (_, i) => {
  const x = i % WIDTH
  const y = Math.floor(i / WIDTH)
  return { x, y, type: cellType(x, y) }
})

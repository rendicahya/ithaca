import { msg } from '@/lib/i18n/translate'
import { createRng, randomInt } from '@/lib/random'

import {
  ALPHA,
  EPSILON_DECAY,
  EPSILON_START,
  GAMMA,
  GOAL,
  GOAL_REWARD,
  HEIGHT,
  MAX_EPISODES,
  MAX_STEPS_PER_EPISODE,
  SEED,
  START,
  STEP_REWARD,
  TRAP,
  TRAP_REWARD,
  WALL,
  WIDTH,
} from './dataset'
import { actions, bestAction, cellKey, cloneState } from './types'
import type { Action, QLearningState, QLearningStep, QTable } from './types'

export const qLearningPseudocode = [
  'initialize Q(s, a) ← 0 for every state s and action a',
  'for each episode',
  '    s ← start state; decay epsilon',
  '    while s is not terminal and the step limit is not reached',
  '        choose action a: random with probability ε, else argmax_a Q(s, a)',
  '        take action a, observe reward r and next state s′',
  '        Q(s, a) ← Q(s, a) + α[ r + γ·max_a′ Q(s′, a′) − Q(s, a) ]',
  '        s ← s′',
  'return the learned Q-table (policy = argmax_a Q(s, a))',
]

type Pos = { x: number; y: number }

function inBounds(p: Pos): boolean {
  return p.x >= 0 && p.x < WIDTH && p.y >= 0 && p.y < HEIGHT
}

function isWall(p: Pos): boolean {
  return p.x === WALL.x && p.y === WALL.y
}

function isTerminal(p: Pos): boolean {
  return (p.x === GOAL.x && p.y === GOAL.y) || (p.x === TRAP.x && p.y === TRAP.y)
}

function move(p: Pos, action: Action): Pos {
  const next = { ...p }
  if (action === 'up') next.y -= 1
  if (action === 'down') next.y += 1
  if (action === 'left') next.x -= 1
  if (action === 'right') next.x += 1
  if (!inBounds(next) || isWall(next)) return p
  return next
}

function rewardFor(p: Pos): number {
  if (p.x === GOAL.x && p.y === GOAL.y) return GOAL_REWARD
  if (p.x === TRAP.x && p.y === TRAP.y) return TRAP_REWARD
  return STEP_REWARD
}

function initialQTable(): QTable {
  const table: QTable = {}
  for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
      if (isWall({ x, y })) continue
      table[cellKey({ x, y })] = { up: 0, down: 0, left: 0, right: 0 }
    }
  }
  return table
}

export function runQLearning(): QLearningStep[] {
  const steps: QLearningStep[] = []
  const rng = createRng(SEED)

  const state: QLearningState = {
    episode: 1,
    maxEpisodes: MAX_EPISODES,
    episodeStep: 0,
    maxStepsPerEpisode: MAX_STEPS_PER_EPISODE,
    epsilon: EPSILON_START,
    alpha: ALPHA,
    gamma: GAMMA,
    qTable: initialQTable(),
    agentPos: { ...START },
    lastAction: null,
    wasExploration: null,
    lastReward: null,
    episodeOutcome: null,
    done: false,
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 1,
    explanation: msg('qlearning.init', {
      alpha: ALPHA,
      gamma: GAMMA,
      episodes: MAX_EPISODES,
    }),
    traceEntry: msg('qlearning.init.trace'),
  })

  while (state.episode <= MAX_EPISODES) {
    state.agentPos = { ...START }
    state.episodeStep = 0
    state.episodeOutcome = null

    while (!isTerminal(state.agentPos) && state.episodeStep < MAX_STEPS_PER_EPISODE) {
      const s = { ...state.agentPos }
      const qs = state.qTable[cellKey(s)]
      const explore = rng() < state.epsilon
      const action = explore ? actions[randomInt(rng, 0, actions.length)] : bestAction(qs)

      const sPrime = move(s, action)
      const reward = rewardFor(sPrime)
      const qsPrime = state.qTable[cellKey(sPrime)]
      const maxNext = isTerminal(sPrime) ? 0 : Math.max(...actions.map((a) => qsPrime[a]))

      const oldValue = qs[action]
      const newValue = oldValue + ALPHA * (reward + GAMMA * maxNext - oldValue)
      qs[action] = newValue

      state.agentPos = sPrime
      state.lastAction = action
      state.wasExploration = explore
      state.lastReward = reward
      state.episodeStep += 1

      const outcome = sPrime.x === GOAL.x && sPrime.y === GOAL.y
        ? 'goal'
        : sPrime.x === TRAP.x && sPrime.y === TRAP.y
          ? 'trap'
          : null
      if (outcome) state.episodeOutcome = outcome

      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 7,
        explanation: msg(explore ? 'qlearning.moveExplore' : 'qlearning.moveExploit', {
          episode: state.episode,
          from: `(${s.x}, ${s.y})`,
          action,
          to: `(${sPrime.x}, ${sPrime.y})`,
          reward,
          oldValue: oldValue.toFixed(2),
          newValue: newValue.toFixed(2),
        }),
        traceEntry: msg('qlearning.move.trace', {
          episode: state.episode,
          action,
          to: `(${sPrime.x}, ${sPrime.y})`,
        }),
      })
    }

    if (!state.episodeOutcome) state.episodeOutcome = 'timeout'
    state.epsilon *= EPSILON_DECAY
    state.episode += 1
  }

  state.done = true
  const policyPath: string[] = []
  let cursor = { ...START }
  let guard = 0
  while (!isTerminal(cursor) && guard < WIDTH * HEIGHT) {
    policyPath.push(`(${cursor.x}, ${cursor.y})`)
    cursor = move(cursor, bestAction(state.qTable[cellKey(cursor)]))
    guard += 1
  }
  policyPath.push(`(${cursor.x}, ${cursor.y})`)
  const reachesGoal = cursor.x === GOAL.x && cursor.y === GOAL.y

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 9,
    explanation: msg(reachesGoal ? 'qlearning.result.success' : 'qlearning.result.incomplete', {
      path: policyPath.join(' → '),
    }),
    traceEntry: msg(reachesGoal ? 'qlearning.result.success.trace' : 'qlearning.result.incomplete.trace'),
  })

  return steps
}

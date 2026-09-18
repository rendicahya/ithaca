import { describe, expect, it } from 'vitest'

import { GOAL, START } from '../dataset'
import { qLearningPseudocode, runQLearning } from '../qlearning'
import { bestAction, cellKey } from '../types'

describe('runQLearning', () => {
  const steps = runQLearning()
  const last = steps[steps.length - 1]

  it('terminates', () => {
    expect(last.state.done).toBe(true)
  })

  it('learns a policy that reaches the goal from the start state', () => {
    let pos = { ...START }
    let guard = 0
    while (!(pos.x === GOAL.x && pos.y === GOAL.y) && guard < 20) {
      const action = bestAction(last.state.qTable[cellKey(pos)])
      const next = { ...pos }
      if (action === 'up') next.y -= 1
      if (action === 'down') next.y += 1
      if (action === 'left') next.x -= 1
      if (action === 'right') next.x += 1
      pos = next
      guard += 1
    }
    expect(pos).toEqual(GOAL)
  })

  it('never exceeds the configured maximum number of episodes', () => {
    expect(last.state.episode).toBeLessThanOrEqual(last.state.maxEpisodes + 1)
  })

  it('keeps the agent within the grid and off the wall at every step', () => {
    for (const step of steps) {
      const { x, y } = step.state.agentPos
      expect(x).toBeGreaterThanOrEqual(0)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(cellKey({ x, y }) in step.state.qTable || (x === START.x && y === START.y)).toBe(true)
    }
  })

  it('every step references a valid pseudocode line', () => {
    for (const step of steps) {
      expect(step.activePseudocodeLine).toBeGreaterThanOrEqual(1)
      expect(step.activePseudocodeLine).toBeLessThanOrEqual(qLearningPseudocode.length)
    }
  })
})

describe('runQLearning — determinism', () => {
  it('produces an identical run every time given the fixed seed', () => {
    const a = runQLearning()
    const b = runQLearning()
    expect(a.length).toBe(b.length)
    expect(a[a.length - 1].state.qTable).toEqual(b[b.length - 1].state.qTable)
  })
})

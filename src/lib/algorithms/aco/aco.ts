import { defaultGraph } from '@/lib/graph/defaultGraph'
import type { NodeId } from '@/lib/graph/types'
import { msg } from '@/lib/i18n/translate'
import { createRng, weightedChoice } from '@/lib/random'

import { cloneAnt, cloneState, pathToString } from './types'
import type { ACOState, ACOStep, AntPath, EdgeCandidate } from './types'

export const acoPseudocode = [
  'initialize pheromone τ(e) ← τ0 on every edge',
  'while iteration < maxIterations',
  '    for each ant k ← 1 to numAnts',
  '        at each node, choose the next edge with probability',
  '            P(e) = τ(e)^α · η(e)^β / Σ τ(e′)^α · η(e′)^β',
  '        repeat until the ant reaches the goal',
  '    evaporate: τ(e) ← (1 − ρ) · τ(e) for every edge',
  '    for each ant k',
  '        deposit Δτ = Q / cost(path_k) on every edge in path_k',
  '    update the best path found so far',
  '    iteration ← iteration + 1',
  'return best path found',
]

// Fixed teaching configuration — deliberately chosen and not user-configurable
// (see CLAUDE.md determinism rules). Reuses the shared weighted search graph
// so a lecturer can contrast ACO's stochastic pheromone trail against UCS/A*'s
// deterministic path on the exact same graph.
const NUM_ANTS = 3
const MAX_ITERATIONS = 3
const ALPHA = 1 // pheromone influence
const BETA = 2 // heuristic (1/cost) influence
const EVAPORATION_RATE = 0.3
const DEPOSIT_FACTOR = 100
const TAU0 = 1
const SEED = 11

const graph = defaultGraph

function outgoingEdges(nodeId: NodeId) {
  return graph.edges.filter((e) => e.source === nodeId)
}

export function runACO(): ACOStep[] {
  const steps: ACOStep[] = []
  const rng = createRng(SEED)

  const pheromone: Record<string, number> = {}
  for (const edge of graph.edges) pheromone[edge.id] = TAU0

  const state: ACOState = {
    iteration: 1,
    maxIterations: MAX_ITERATIONS,
    alpha: ALPHA,
    beta: BETA,
    evaporationRate: EVAPORATION_RATE,
    depositFactor: DEPOSIT_FACTOR,
    pheromone,
    ants: [],
    currentAntId: null,
    candidates: null,
    iterationBestPath: null,
    iterationBestCost: null,
    globalBestPath: null,
    globalBestCost: null,
    done: false,
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 1,
    explanation: msg('aco.init', { tau0: TAU0, count: graph.edges.length }),
    traceEntry: msg('aco.init.trace', { count: graph.edges.length }),
  })

  while (state.iteration <= MAX_ITERATIONS) {
    state.ants = []

    for (let k = 0; k < NUM_ANTS; k++) {
      const ant: AntPath = { id: `Ant${k + 1}`, nodes: [graph.start], edges: [], cost: 0, reachedGoal: false }
      state.ants = [...state.ants, ant]
      state.currentAntId = ant.id
      state.candidates = null

      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 3,
        explanation: msg('aco.antStart', { ant: ant.id, start: graph.start }),
        traceEntry: msg('aco.antStart.trace', { ant: ant.id }),
      })

      while (!ant.reachedGoal) {
        const current = ant.nodes[ant.nodes.length - 1]
        const options = outgoingEdges(current)

        const candidates: EdgeCandidate[] = options.map((edge) => {
          const heuristic = 1 / edge.cost
          const weight = pheromone[edge.id] ** ALPHA * heuristic ** BETA
          return { edgeId: edge.id, targetId: edge.target, pheromone: pheromone[edge.id], heuristic, probability: weight }
        })
        const totalWeight = candidates.reduce((sum, c) => sum + c.probability, 0)
        for (const c of candidates) c.probability = c.probability / totalWeight

        const chosenIndex = weightedChoice(
          rng,
          candidates.map((c) => c.probability),
        )
        const chosenEdge = options[chosenIndex]
        const chosen = candidates[chosenIndex]

        state.candidates = candidates
        ant.nodes = [...ant.nodes, chosenEdge.target]
        ant.edges = [...ant.edges, chosenEdge.id]
        ant.cost += chosenEdge.cost
        ant.reachedGoal = chosenEdge.target === graph.goal
        state.ants = state.ants.map((a) => (a.id === ant.id ? cloneAnt(ant) : a))

        steps.push({
          state: cloneState(state),
          activePseudocodeLine: 5,
          explanation: msg('aco.chooseEdge', {
            ant: ant.id,
            from: current,
            to: chosenEdge.target,
            probability: (chosen.probability * 100).toFixed(0),
          }),
          traceEntry: msg('aco.chooseEdge.trace', {
            ant: ant.id,
            from: current,
            to: chosenEdge.target,
          }),
        })
      }

      state.candidates = null
      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 6,
        explanation: msg('aco.antDone', {
          ant: ant.id,
          path: pathToString(ant.nodes),
          cost: ant.cost,
        }),
        traceEntry: msg('aco.antDone.trace', { ant: ant.id, cost: ant.cost }),
      })
    }

    state.currentAntId = null
    for (const edge of graph.edges) {
      state.pheromone[edge.id] = (1 - EVAPORATION_RATE) * state.pheromone[edge.id]
    }

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 7,
      explanation: msg('aco.evaporate', { rate: Math.round(EVAPORATION_RATE * 100) }),
      traceEntry: msg('aco.evaporate.trace', { rate: Math.round(EVAPORATION_RATE * 100) }),
    })

    for (const ant of state.ants) {
      const deposit = DEPOSIT_FACTOR / ant.cost
      for (const edgeId of ant.edges) {
        state.pheromone[edgeId] += deposit
      }

      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 9,
        explanation: msg('aco.deposit', {
          ant: ant.id,
          amount: deposit.toFixed(2),
          cost: ant.cost,
        }),
        traceEntry: msg('aco.deposit.trace', { ant: ant.id, amount: deposit.toFixed(2) }),
      })
    }

    const iterationBest = state.ants.reduce((best, a) => (a.cost < best.cost ? a : best))
    state.iterationBestPath = [...iterationBest.nodes]
    state.iterationBestCost = iterationBest.cost
    const improvedGlobal = state.globalBestCost === null || iterationBest.cost < state.globalBestCost
    if (improvedGlobal) {
      state.globalBestPath = [...iterationBest.nodes]
      state.globalBestCost = iterationBest.cost
    }

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 10,
      explanation: improvedGlobal
        ? msg('aco.newBest', {
            path: pathToString(iterationBest.nodes),
            cost: iterationBest.cost,
          })
        : msg('aco.noNewBest', {
            path: pathToString(state.globalBestPath as NodeId[]),
            cost: state.globalBestCost as number,
          }),
      traceEntry: improvedGlobal
        ? msg('aco.newBest.trace', { cost: iterationBest.cost })
        : msg('aco.noNewBest.trace', { cost: state.globalBestCost as number }),
    })

    state.iteration += 1
    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 11,
      explanation: msg('aco.iterationEnd', { iteration: state.iteration }),
      traceEntry: msg('aco.iterationEnd.trace', { iteration: state.iteration }),
    })
  }

  state.done = true
  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 12,
    explanation: msg('aco.result', {
      path: pathToString(state.globalBestPath as NodeId[]),
      cost: state.globalBestCost as number,
    }),
    traceEntry: msg('aco.result.trace', { cost: state.globalBestCost as number }),
  })

  return steps
}

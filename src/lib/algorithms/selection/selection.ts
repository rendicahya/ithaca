import { msg } from '@/lib/i18n/translate'

import { createRng, randomInt } from '@/lib/random'
import { cloneSelectionState } from './types'
import type { SelectionCandidate, SelectionState, SelectionStep } from './types'

// A standalone illustration of the two selection mechanisms used to pick
// parents in a genetic algorithm. Deliberately not tied to a specific GA
// problem (knapsack, route, ...) so it reads as general-purpose theory.
export const selectionPseudocode = [
  'list the population with each individual’s fitness',
  'Roulette Wheel: p(i) ← fitness(i) / total fitness',
  'spin the wheel; the individual whose slice contains the random point wins',
  'Tournament: randomly choose k individuals from the population',
  'the individual with the highest fitness among them wins',
]

const POPULATION: SelectionCandidate[] = [
  { id: 'A', fitness: 8 },
  { id: 'B', fitness: 5 },
  { id: 'C', fitness: 3 },
  { id: 'D', fitness: 6 },
  { id: 'E', fitness: 2 },
]

const TOURNAMENT_SIZE = 3
const SEED = 7

export function runSelectionDemo(): SelectionStep[] {
  const rng = createRng(SEED)
  const totalFitness = POPULATION.reduce((sum, p) => sum + p.fitness, 0)

  const state: SelectionState = {
    population: POPULATION,
    totalFitness,
    phase: 'population',
    spinFraction: null,
    rouletteWinnerId: null,
    tournamentSize: TOURNAMENT_SIZE,
    tournamentCandidateIds: [],
    tournamentWinnerId: null,
  }

  const steps: SelectionStep[] = []

  steps.push({
    state: cloneSelectionState(state),
    activePseudocodeLine: 1,
    explanation: msg('selection.population', { count: POPULATION.length }),
    traceEntry: msg('selection.population.trace'),
  })

  state.phase = 'rouletteSetup'
  steps.push({
    state: cloneSelectionState(state),
    activePseudocodeLine: 2,
    explanation: msg('selection.rouletteSetup', { total: totalFitness }),
    traceEntry: msg('selection.rouletteSetup.trace'),
  })

  const spin = rng() * totalFitness
  let acc = 0
  let rouletteWinnerId = POPULATION[POPULATION.length - 1].id
  for (const p of POPULATION) {
    acc += p.fitness
    if (spin <= acc) {
      rouletteWinnerId = p.id
      break
    }
  }
  state.phase = 'rouletteSpin'
  state.spinFraction = spin / totalFitness
  state.rouletteWinnerId = rouletteWinnerId
  steps.push({
    state: cloneSelectionState(state),
    activePseudocodeLine: 3,
    explanation: msg('selection.rouletteSpin', { winner: rouletteWinnerId }),
    traceEntry: msg('selection.rouletteSpin.trace', { winner: rouletteWinnerId }),
  })

  const candidateIndices: number[] = []
  while (candidateIndices.length < TOURNAMENT_SIZE) {
    const idx = randomInt(rng, 0, POPULATION.length)
    if (!candidateIndices.includes(idx)) candidateIndices.push(idx)
  }
  const tournamentCandidates = candidateIndices.map((i) => POPULATION[i])
  state.phase = 'tournamentPick'
  state.tournamentCandidateIds = tournamentCandidates.map((c) => c.id)
  steps.push({
    state: cloneSelectionState(state),
    activePseudocodeLine: 4,
    explanation: msg('selection.tournamentPick', {
      size: TOURNAMENT_SIZE,
      ids: tournamentCandidates.map((c) => c.id).join(', '),
    }),
    traceEntry: msg('selection.tournamentPick.trace', { size: TOURNAMENT_SIZE }),
  })

  const tournamentWinner = tournamentCandidates.reduce((best, c) =>
    c.fitness > best.fitness ? c : best,
  )
  state.phase = 'tournamentWinner'
  state.tournamentWinnerId = tournamentWinner.id
  steps.push({
    state: cloneSelectionState(state),
    activePseudocodeLine: 5,
    explanation: msg('selection.tournamentWinner', {
      winner: tournamentWinner.id,
      fitness: tournamentWinner.fitness,
    }),
    traceEntry: msg('selection.tournamentWinner.trace', { winner: tournamentWinner.id }),
  })

  return steps
}

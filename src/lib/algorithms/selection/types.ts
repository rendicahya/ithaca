import type { Message } from '@/lib/i18n/translate'

export interface SelectionCandidate {
  id: string
  fitness: number
}

export type SelectionPhase =
  | 'population'
  | 'rouletteSetup'
  | 'rouletteSpin'
  | 'tournamentPick'
  | 'tournamentWinner'

export interface SelectionState {
  population: SelectionCandidate[]
  totalFitness: number
  phase: SelectionPhase
  /** Fraction (0..1) along the wheel's circumference where the spin landed. */
  spinFraction: number | null
  rouletteWinnerId: string | null
  tournamentSize: number
  tournamentCandidateIds: string[]
  tournamentWinnerId: string | null
}

export interface SelectionStep {
  state: SelectionState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
}

export function cloneSelectionState(state: SelectionState): SelectionState {
  return {
    ...state,
    population: state.population.map((p) => ({ ...p })),
    tournamentCandidateIds: [...state.tournamentCandidateIds],
  }
}

import type { Message } from '@/lib/i18n/translate'

export interface LinRegState {
  epoch: number
  maxEpochs: number
  learningRate: number
  m: number
  b: number
  loss: number | null
  gradients: { dm: number; db: number } | null
  done: boolean
}

export interface LinRegStep {
  state: LinRegState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
}

export function cloneState(state: LinRegState): LinRegState {
  return {
    ...state,
    gradients: state.gradients ? { ...state.gradients } : null,
  }
}

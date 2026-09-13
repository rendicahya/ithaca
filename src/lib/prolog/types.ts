import type { Message } from '@/lib/i18n/translate'

import type { Bindings, Term } from './terms'

export type ProofNodeStatus = 'pending' | 'current' | 'success' | 'failed' | 'backtracked'

export interface ProofTreeNode {
  id: string
  term: Term
  parentId: string | null
  status: ProofNodeStatus
}

export interface ProofTreeEdge {
  id: string
  source: string
  target: string
}

export interface GoalFrame {
  id: string
  term: Term
}

export interface ChoicePointView {
  goalId: string
  term: Term
  remaining: number
}

export interface ProofState {
  goals: GoalFrame[]
  currentGoalId: string | null
  /** Full internal bindings (including renamed clause variables) — used to resolve tree/goal labels for display. */
  bindings: Bindings
  /** Current bindings for each variable in the original query — the part students care about. */
  queryBindings: Record<string, Term | null>
  choicePoints: ChoicePointView[]
  /** Query-variable bindings for every solution found so far. */
  solutions: Record<string, Term>[]
  done: boolean
  treeNodes: ProofTreeNode[]
  treeEdges: ProofTreeEdge[]
}

export interface ProofStep {
  state: ProofState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
}

export function cloneProofState(state: ProofState): ProofState {
  return {
    goals: [...state.goals],
    currentGoalId: state.currentGoalId,
    bindings: { ...state.bindings },
    queryBindings: { ...state.queryBindings },
    choicePoints: [...state.choicePoints],
    solutions: [...state.solutions],
    done: state.done,
    treeNodes: [...state.treeNodes],
    treeEdges: [...state.treeEdges],
  }
}

export type { Bindings, Term }

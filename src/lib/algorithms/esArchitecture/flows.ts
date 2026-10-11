import { msg } from '@/lib/i18n/translate'
import type { Message } from '@/lib/i18n/translate'

import type { ComponentId, EdgeId } from './diagram'

/** The two journeys through the architecture: building the knowledge base, then using it. */
export type FlowId = 'build' | 'query'

export const flowIds: FlowId[] = ['build', 'query']

export interface ArchState {
  flow: FlowId
  /** Components taking part in the current step. */
  activeComponents: ComponentId[]
  activeEdges: EdgeId[]
  /** The component the current step is mainly about — explained in the side panel. */
  focus: ComponentId
  /** Order in which each component first took part in the flow (1-based), up to this step. */
  firstVisit: Partial<Record<ComponentId, number>>
  done: boolean
}

export interface ArchStep {
  state: ArchState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
  /** A concrete stroke-risk example of what happens in this step. */
  example: Message
  /** The same example written as Prolog clauses, for steps where the knowledge base takes shape. */
  prolog?: Message
}

interface StepSpec {
  line: number
  focus: ComponentId
  components: ComponentId[]
  edges: EdgeId[]
  /** Show the step's example as Prolog code too. */
  prolog?: boolean
}

export const flowPseudocode: Record<FlowId, string[]> = {
  build: [
    'expert ← domain expert who knows how to solve the problem',
    'knowledge ← acquire(expert)          // interviews, observation, documents',
    'engineer encodes knowledge as facts and IF–THEN rules',
    'knowledgeBase ← facts + rules',
    'connect the inference engine to knowledgeBase',
    'run test cases; refine knowledgeBase where conclusions are wrong',
    'repeat 2–6 until the expert agrees with the conclusions',
    'knowledgeBase is ready for consultation',
  ],
  query: [
    'user describes the case through the user interface',
    'facts ← facts about the specific incident',
    'write facts to the blackboard (working memory)',
    'inference engine matches facts against rules in knowledgeBase',
    'scheduler picks the next rule; consistency enforcer checks conflicts',
    'record new conclusions on the blackboard',
    'interpreter turns the conclusion into a recommended action',
    'user interface shows the recommendation to the user',
    'if the user asks "why?" or "how?", explanation facility answers',
    'feedback from real cases returns to the experts (dashed line)',
  ],
}

// Step 0 of each flow introduces the environment it happens in; the rest
// follow the pseudocode one line at a time.
const flowSpecs: Record<FlowId, StepSpec[]> = {
  build: [
    { line: 0, focus: 'developmentEnv', components: ['developmentEnv'], edges: [] },
    { line: 1, focus: 'expertKnowledge', components: ['expertKnowledge'], edges: [] },
    {
      line: 2,
      focus: 'knowledgeAcquisition',
      components: ['expertKnowledge', 'knowledgeAcquisition', 'knowledgeEngineer'],
      edges: ['exp-acq', 'acq-eng'],
    },
    {
      line: 3,
      focus: 'knowledgeEngineer',
      components: ['knowledgeEngineer', 'knowledgeBase'],
      edges: ['eng-kb'],
      prolog: true,
    },
    { line: 4, focus: 'knowledgeBase', components: ['knowledgeBase'], edges: [], prolog: true },
    { line: 5, focus: 'inferenceEngine', components: ['knowledgeBase', 'inferenceEngine'], edges: ['kb-ie'] },
    {
      line: 6,
      focus: 'knowledgeRefinement',
      components: ['inferenceEngine', 'knowledgeRefinement', 'knowledgeBase'],
      edges: ['ie-kr', 'kr-kb'],
      prolog: true,
    },
    {
      line: 7,
      focus: 'knowledgeRefinement',
      components: ['expertKnowledge', 'knowledgeAcquisition', 'knowledgeEngineer', 'knowledgeBase', 'knowledgeRefinement'],
      edges: ['exp-acq', 'acq-eng', 'eng-kb', 'kr-kb'],
    },
    { line: 8, focus: 'knowledgeBase', components: ['knowledgeBase', 'inferenceEngine'], edges: ['kb-ie'] },
  ],
  query: [
    { line: 0, focus: 'consultationEnv', components: ['consultationEnv'], edges: [] },
    { line: 1, focus: 'userInterface', components: ['user', 'userInterface'], edges: ['user-ui'] },
    { line: 2, focus: 'user', components: ['user', 'userInterface'], edges: ['user-ui'] },
    {
      line: 3,
      focus: 'blackboard',
      components: ['userInterface', 'inferenceEngine', 'blackboard'],
      edges: ['ui-ie', 'ie-bb'],
    },
    { line: 4, focus: 'inferenceEngine', components: ['inferenceEngine', 'knowledgeBase'], edges: ['kb-ie'] },
    { line: 5, focus: 'inferenceEngine', components: ['inferenceEngine'], edges: [] },
    { line: 6, focus: 'blackboard', components: ['inferenceEngine', 'blackboard'], edges: ['ie-bb'] },
    {
      line: 7,
      focus: 'recommendedAction',
      components: ['inferenceEngine', 'recommendedAction'],
      edges: ['rec-ie'],
    },
    {
      line: 8,
      focus: 'userInterface',
      components: ['recommendedAction', 'userInterface', 'user'],
      edges: ['ui-rec', 'user-ui'],
    },
    {
      line: 9,
      focus: 'explanationFacility',
      components: ['user', 'userInterface', 'explanationFacility', 'knowledgeBase'],
      edges: ['user-ui', 'ui-expl', 'kb-expl'],
    },
    {
      line: 10,
      focus: 'expertKnowledge',
      components: ['recommendedAction', 'expertKnowledge', 'knowledgeRefinement'],
      edges: ['feedback'],
    },
  ],
}

export function runArchitectureFlow(flow: FlowId): ArchStep[] {
  const specs = flowSpecs[flow]
  const firstVisit: Partial<Record<ComponentId, number>> = {}
  let order = 0

  return specs.map((spec, i) => {
    // The environment headings frame the flow rather than being a stage of it.
    for (const c of spec.components) {
      if (c === 'consultationEnv' || c === 'developmentEnv') continue
      if (firstVisit[c] === undefined) firstVisit[c] = ++order
    }
    return {
      state: {
        flow,
        activeComponents: [...spec.components],
        activeEdges: [...spec.edges],
        focus: spec.focus,
        firstVisit: { ...firstVisit },
        done: i === specs.length - 1,
      },
      activePseudocodeLine: spec.line,
      explanation: msg(`esArch.${flow}.step${i}`),
      traceEntry: msg(`esArch.${flow}.step${i}.trace`),
      example: msg(`esArch.${flow}.step${i}.example`),
      prolog: spec.prolog ? msg(`esArch.${flow}.step${i}.prolog`) : undefined,
    }
  })
}

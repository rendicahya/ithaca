/**
 * Layout of the general expert-system architecture diagram (Turban), in a
 * 1000 × 620 SVG coordinate space. Positions follow the lecture slide so
 * students can map the interactive version onto the one they studied.
 */
export type ComponentId =
  | 'consultationEnv'
  | 'developmentEnv'
  | 'user'
  | 'userInterface'
  | 'explanationFacility'
  | 'recommendedAction'
  | 'inferenceEngine'
  | 'blackboard'
  | 'knowledgeBase'
  | 'knowledgeEngineer'
  | 'expertKnowledge'
  | 'knowledgeAcquisition'
  | 'knowledgeRefinement'

/** Box shapes from the slide: rectangles for system parts, pills for people/sources, chips for processes on arrows. */
export type BoxShape = 'rect' | 'pill' | 'chip' | 'heading'

export interface DiagramBox {
  id: ComponentId
  shape: BoxShape
  x: number
  y: number
  w: number
  h: number
}

export const diagramBoxes: DiagramBox[] = [
  { id: 'consultationEnv', shape: 'heading', x: 20, y: 8, w: 460, h: 36 },
  { id: 'developmentEnv', shape: 'heading', x: 520, y: 8, w: 460, h: 36 },
  { id: 'user', shape: 'pill', x: 50, y: 62, w: 150, h: 48 },
  { id: 'userInterface', shape: 'rect', x: 40, y: 172, w: 170, h: 56 },
  { id: 'explanationFacility', shape: 'rect', x: 280, y: 150, w: 170, h: 60 },
  { id: 'recommendedAction', shape: 'rect', x: 40, y: 330, w: 170, h: 64 },
  { id: 'inferenceEngine', shape: 'rect', x: 250, y: 290, w: 230, h: 120 },
  { id: 'blackboard', shape: 'rect', x: 245, y: 470, w: 240, h: 80 },
  { id: 'knowledgeBase', shape: 'rect', x: 540, y: 62, w: 420, h: 108 },
  { id: 'knowledgeEngineer', shape: 'pill', x: 790, y: 222, w: 160, h: 56 },
  { id: 'knowledgeAcquisition', shape: 'chip', x: 775, y: 308, w: 190, h: 44 },
  { id: 'expertKnowledge', shape: 'pill', x: 790, y: 382, w: 160, h: 56 },
  { id: 'knowledgeRefinement', shape: 'rect', x: 560, y: 410, w: 170, h: 60 },
]

export type EdgeId =
  | 'user-ui'
  | 'ui-expl'
  | 'ui-rec'
  | 'ui-ie'
  | 'rec-ie'
  | 'ie-bb'
  | 'kb-ie'
  | 'kb-expl'
  | 'ie-kr'
  | 'kr-kb'
  | 'eng-kb'
  | 'exp-acq'
  | 'acq-eng'
  | 'feedback'

export interface DiagramEdge {
  id: EdgeId
  /** Polyline points; the arrowhead is drawn at the last point. */
  points: [number, number][]
  /** Arrowheads at both ends — information flows both ways. */
  bidirectional: boolean
  dashed?: boolean
}

export const diagramEdges: DiagramEdge[] = [
  { id: 'user-ui', points: [[125, 110], [125, 172]], bidirectional: true },
  { id: 'ui-expl', points: [[210, 190], [280, 190]], bidirectional: true },
  { id: 'ui-rec', points: [[90, 228], [90, 330]], bidirectional: true },
  { id: 'ui-ie', points: [[170, 228], [170, 310], [250, 310]], bidirectional: false },
  { id: 'rec-ie', points: [[210, 370], [250, 370]], bidirectional: true },
  { id: 'ie-bb', points: [[365, 410], [365, 470]], bidirectional: true },
  { id: 'kb-ie', points: [[540, 130], [500, 130], [500, 250], [455, 250], [455, 290]], bidirectional: true },
  { id: 'kb-expl', points: [[500, 180], [450, 180]], bidirectional: false },
  { id: 'ie-kr', points: [[480, 380], [610, 380], [610, 410]], bidirectional: false },
  { id: 'kr-kb', points: [[690, 410], [690, 170]], bidirectional: true },
  { id: 'eng-kb', points: [[870, 222], [870, 170]], bidirectional: false },
  // Knowledge passes through acquisition, so the arrow stops at the chip and
  // continues from it rather than running underneath it.
  { id: 'exp-acq', points: [[870, 382], [870, 352]], bidirectional: false },
  { id: 'acq-eng', points: [[870, 308], [870, 278]], bidirectional: false },
  {
    id: 'feedback',
    points: [[40, 380], [20, 380], [20, 595], [870, 595], [870, 438]],
    bidirectional: false,
    dashed: true,
  },
]

/**
 * A picture for each box so the audience can tell the roles apart at a
 * glance — e.g. the expert is a doctor, the knowledge engineer a programmer.
 */
export const componentIcons: Partial<Record<ComponentId, string>> = {
  user: '🧑',
  userInterface: '🖥️',
  explanationFacility: '💬',
  recommendedAction: '📋',
  inferenceEngine: '🧠',
  blackboard: '📝',
  knowledgeBase: '📚',
  knowledgeEngineer: '🧑‍💻',
  expertKnowledge: '🧑‍⚕️',
  knowledgeAcquisition: '🎤',
  knowledgeRefinement: '🔧',
}

/** Sub-parts listed inside a box on the slide; each has its own explanation. */
export const subcomponents: Partial<Record<ComponentId, string[]>> = {
  inferenceEngine: ['drawConclusion', 'interpreter', 'scheduler', 'consistencyEnforcer'],
  blackboard: ['workplace', 'planAgenda', 'solutionDescription'],
  knowledgeBase: ['facts', 'rules'],
}

export function componentKey(id: ComponentId, field: 'name' | 'description' | 'function'): string {
  return `esArch.component.${id}.${field}`
}

export function subcomponentKey(id: ComponentId, sub: string, field: 'name' | 'description'): string {
  return `esArch.component.${id}.sub.${sub}.${field}`
}

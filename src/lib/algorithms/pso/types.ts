import type { Message } from '@/lib/i18n/translate'

export interface Vec2 {
  x: number
  y: number
}

export interface Particle {
  id: string
  position: Vec2
  velocity: Vec2
  fitness: number
  personalBest: Vec2
  personalBestFitness: number
}

export interface PSOState {
  iteration: number
  maxIterations: number
  inertiaWeight: number
  cognitiveCoeff: number
  socialCoeff: number
  bounds: { min: number; max: number }
  particles: Particle[]
  globalBest: Vec2
  globalBestFitness: number
  /** The particle currently being updated, so the view can highlight it. */
  currentParticleId: string | null
  done: boolean
}

export interface PSOStep {
  state: PSOState
  activePseudocodeLine: number
  explanation: Message
  traceEntry?: Message
}

export function cloneParticle(p: Particle): Particle {
  return {
    id: p.id,
    position: { ...p.position },
    velocity: { ...p.velocity },
    fitness: p.fitness,
    personalBest: { ...p.personalBest },
    personalBestFitness: p.personalBestFitness,
  }
}

export function cloneState(state: PSOState): PSOState {
  return {
    ...state,
    bounds: { ...state.bounds },
    particles: state.particles.map(cloneParticle),
    globalBest: { ...state.globalBest },
  }
}

/**
 * The objective function PSO minimizes: a paraboloid bowl with its minimum
 * away from the origin (2, -3), so particles must visibly travel to find it
 * rather than already starting there.
 */
export function fitnessOf(pos: Vec2): number {
  return (pos.x - 2) ** 2 + (pos.y + 3) ** 2
}

export const OPTIMUM: Vec2 = { x: 2, y: -3 }

export function formatVec(v: Vec2): string {
  return `(${v.x.toFixed(2)}, ${v.y.toFixed(2)})`
}

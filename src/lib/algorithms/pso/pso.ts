import { msg } from '@/lib/i18n/translate'
import { createRng, randomFloat } from '@/lib/random'

import { cloneParticle, cloneState, fitnessOf, formatVec } from './types'
import type { Particle, PSOState, PSOStep, Vec2 } from './types'

export const psoPseudocode = [
  'initialize each particle with random position and velocity',
  'evaluate fitness of each particle; set personalBest and globalBest',
  'while iteration < maxIterations',
  '    for each particle',
  '        v ← w·v + c1·r1·(personalBest − x) + c2·r2·(globalBest − x)',
  '        x ← x + v, clamped to the search bounds',
  '        evaluate fitness(x)',
  '        if fitness(x) is better than personalBest, update personalBest',
  '        if fitness(x) is better than globalBest, update globalBest',
  '    iteration ← iteration + 1',
  'return globalBest',
]

// Fixed teaching configuration — deliberately chosen and not user-configurable,
// so a lecturer always gets the same run to explain (see CLAUDE.md determinism).
const NUM_PARTICLES = 4
const MAX_ITERATIONS = 5
const INERTIA_WEIGHT = 0.6
const COGNITIVE_COEFF = 1.4
const SOCIAL_COEFF = 1.4
const BOUNDS = { min: -6, max: 6 }
const SEED = 7

function clamp(v: number): number {
  return Math.min(BOUNDS.max, Math.max(BOUNDS.min, v))
}

export function runPSO(): PSOStep[] {
  const steps: PSOStep[] = []
  const rng = createRng(SEED)

  function randomPosition(): Vec2 {
    return { x: randomFloat(rng, BOUNDS.min, BOUNDS.max), y: randomFloat(rng, BOUNDS.min, BOUNDS.max) }
  }

  function randomVelocity(): Vec2 {
    const span = (BOUNDS.max - BOUNDS.min) / 4
    return { x: randomFloat(rng, -span, span), y: randomFloat(rng, -span, span) }
  }

  const particles: Particle[] = Array.from({ length: NUM_PARTICLES }, (_, i) => {
    const position = randomPosition()
    const fitness = fitnessOf(position)
    return {
      id: `P${i + 1}`,
      position,
      velocity: randomVelocity(),
      fitness,
      personalBest: { ...position },
      personalBestFitness: fitness,
    }
  })

  const initialBest = particles.reduce((best, p) => (p.fitness < best.fitness ? p : best))

  const state: PSOState = {
    iteration: 1,
    maxIterations: MAX_ITERATIONS,
    inertiaWeight: INERTIA_WEIGHT,
    cognitiveCoeff: COGNITIVE_COEFF,
    socialCoeff: SOCIAL_COEFF,
    bounds: BOUNDS,
    particles,
    globalBest: { ...initialBest.position },
    globalBestFitness: initialBest.fitness,
    currentParticleId: null,
    done: false,
  }

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 1,
    explanation: msg('pso.init', { count: NUM_PARTICLES }),
    traceEntry: msg('pso.init.trace', { count: NUM_PARTICLES }),
  })

  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 2,
    explanation: msg('pso.evaluateInit', {
      particle: initialBest.id,
      fitness: initialBest.fitness.toFixed(2),
    }),
    traceEntry: msg('pso.evaluateInit.trace', { fitness: initialBest.fitness.toFixed(2) }),
  })

  while (state.iteration <= MAX_ITERATIONS) {
    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 3,
      explanation: msg('pso.iterationStart', { iteration: state.iteration }),
      traceEntry: msg('pso.iterationStart.trace', { iteration: state.iteration }),
    })

    for (const particle of state.particles) {
      state.currentParticleId = particle.id

      const r1 = rng()
      const r2 = rng()
      const newVelocity: Vec2 = {
        x:
          INERTIA_WEIGHT * particle.velocity.x +
          COGNITIVE_COEFF * r1 * (particle.personalBest.x - particle.position.x) +
          SOCIAL_COEFF * r2 * (state.globalBest.x - particle.position.x),
        y:
          INERTIA_WEIGHT * particle.velocity.y +
          COGNITIVE_COEFF * r1 * (particle.personalBest.y - particle.position.y) +
          SOCIAL_COEFF * r2 * (state.globalBest.y - particle.position.y),
      }
      particle.velocity = newVelocity

      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 5,
        explanation: msg('pso.updateVelocity', {
          particle: particle.id,
          velocity: formatVec(particle.velocity),
        }),
        traceEntry: msg('pso.updateVelocity.trace', { particle: particle.id }),
      })

      particle.position = {
        x: clamp(particle.position.x + particle.velocity.x),
        y: clamp(particle.position.y + particle.velocity.y),
      }
      particle.fitness = fitnessOf(particle.position)

      steps.push({
        state: cloneState(state),
        activePseudocodeLine: 6,
        explanation: msg('pso.updatePosition', {
          particle: particle.id,
          position: formatVec(particle.position),
          fitness: particle.fitness.toFixed(2),
        }),
        traceEntry: msg('pso.updatePosition.trace', {
          particle: particle.id,
          position: formatVec(particle.position),
        }),
      })

      const improvedPersonal = particle.fitness < particle.personalBestFitness
      if (improvedPersonal) {
        particle.personalBest = { ...particle.position }
        particle.personalBestFitness = particle.fitness
      }
      const improvedGlobal = particle.fitness < state.globalBestFitness
      if (improvedGlobal) {
        state.globalBest = { ...particle.position }
        state.globalBestFitness = particle.fitness
      }

      steps.push({
        state: cloneState(state),
        activePseudocodeLine: improvedGlobal ? 9 : improvedPersonal ? 8 : 8,
        explanation: improvedGlobal
          ? msg('pso.newGlobalBest', {
              particle: particle.id,
              fitness: particle.fitness.toFixed(2),
            })
          : improvedPersonal
            ? msg('pso.newPersonalBest', {
                particle: particle.id,
                fitness: particle.fitness.toFixed(2),
              })
            : msg('pso.noImprovement', { particle: particle.id }),
        traceEntry: improvedGlobal
          ? msg('pso.newGlobalBest.trace', { particle: particle.id })
          : improvedPersonal
            ? msg('pso.newPersonalBest.trace', { particle: particle.id })
            : msg('pso.noImprovement.trace', { particle: particle.id }),
      })
    }

    state.currentParticleId = null
    state.iteration += 1

    steps.push({
      state: cloneState(state),
      activePseudocodeLine: 10,
      explanation: msg('pso.iterationEnd', {
        iteration: state.iteration,
        best: state.globalBestFitness.toFixed(2),
      }),
      traceEntry: msg('pso.iterationEnd.trace', { best: state.globalBestFitness.toFixed(2) }),
    })
  }

  state.done = true
  steps.push({
    state: cloneState(state),
    activePseudocodeLine: 11,
    explanation: msg('pso.result', {
      position: formatVec(state.globalBest),
      fitness: state.globalBestFitness.toFixed(2),
    }),
    traceEntry: msg('pso.result.trace', { fitness: state.globalBestFitness.toFixed(2) }),
  })

  return steps
}

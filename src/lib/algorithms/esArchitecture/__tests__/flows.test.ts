import { describe, expect, it } from 'vitest'

import { dictionary } from '@/lib/i18n/dictionary'

import { componentKey, diagramBoxes, diagramEdges, subcomponentKey, subcomponents } from '../diagram'
import { flowIds, flowPseudocode, runArchitectureFlow } from '../flows'

const boxIds = new Set(diagramBoxes.map((b) => b.id))
const edgeIds = new Set(diagramEdges.map((e) => e.id))

describe('runArchitectureFlow', () => {
  it('building starts from the expert and ends with a ready knowledge base', () => {
    const steps = runArchitectureFlow('build')
    expect(steps[1].state.focus).toBe('expertKnowledge')
    expect(steps.at(-1)!.state.focus).toBe('knowledgeBase')
    expect(steps.at(-1)!.state.done).toBe(true)
  })

  it('building visits expert → acquisition → engineer → knowledge base in that order', () => {
    const { firstVisit } = runArchitectureFlow('build').at(-1)!.state
    expect(firstVisit.expertKnowledge).toBeLessThan(firstVisit.knowledgeAcquisition!)
    expect(firstVisit.knowledgeAcquisition).toBeLessThan(firstVisit.knowledgeEngineer!)
    expect(firstVisit.knowledgeEngineer).toBeLessThan(firstVisit.knowledgeBase!)
    expect(firstVisit.knowledgeBase).toBeLessThan(firstVisit.knowledgeRefinement!)
  })

  it('querying goes user → user interface → inference engine → recommended action', () => {
    const { firstVisit } = runArchitectureFlow('query').at(-1)!.state
    expect(firstVisit.user).toBe(1)
    const [, describeCase, giveFacts] = runArchitectureFlow('query')
    expect(describeCase.state.focus).toBe('user')
    expect(giveFacts.state.focus).toBe('userInterface')
    expect(firstVisit.userInterface).toBeLessThan(firstVisit.inferenceEngine!)
    expect(firstVisit.inferenceEngine).toBeLessThan(firstVisit.recommendedAction!)
    expect(firstVisit.recommendedAction).toBeLessThan(firstVisit.explanationFacility!)
  })

  it('only refers to components and edges that exist in the diagram', () => {
    for (const flow of flowIds) {
      for (const step of runArchitectureFlow(flow)) {
        for (const c of step.state.activeComponents) expect(boxIds.has(c)).toBe(true)
        for (const e of step.state.activeEdges) expect(edgeIds.has(e)).toBe(true)
        expect(step.state.activeComponents).toContain(step.state.focus)
      }
    }
  })

  it('highlights a valid pseudocode line on every step', () => {
    for (const flow of flowIds) {
      for (const step of runArchitectureFlow(flow)) {
        expect(step.activePseudocodeLine).toBeGreaterThanOrEqual(0)
        expect(step.activePseudocodeLine).toBeLessThanOrEqual(flowPseudocode[flow].length)
      }
    }
  })
})

describe('architecture content', () => {
  const keys: string[] = []
  for (const box of diagramBoxes) {
    keys.push(componentKey(box.id, 'name'), componentKey(box.id, 'description'), componentKey(box.id, 'function'))
    for (const sub of subcomponents[box.id] ?? []) {
      keys.push(subcomponentKey(box.id, sub, 'name'), subcomponentKey(box.id, sub, 'description'))
    }
  }
  for (const flow of flowIds) {
    for (const step of runArchitectureFlow(flow)) {
      keys.push(step.explanation.key, step.traceEntry!.key, step.example.key)
      if (step.prolog) keys.push(step.prolog.key)
    }
  }

  it.each(['en', 'id'] as const)('has every text in %s', (locale) => {
    expect(keys.filter((k) => !(k in dictionary[locale]))).toEqual([])
  })
})

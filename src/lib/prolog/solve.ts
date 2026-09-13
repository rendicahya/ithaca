import { msg } from '@/lib/i18n/translate'

import type { Bindings, Clause, Term } from './terms'
import { renameClause, resolveTerm, signature, termToString, v, variablesIn, walk } from './terms'
import type { ChoicePointView, GoalFrame, ProofState, ProofStep, ProofTreeNode } from './types'
import { unify } from './unify'

export const prologPseudocode = [
  'goals ← [query]',
  'choicePoints ← []',
  'while true',
  '    if goals is empty',
  '        record solution',
  '        if no choice points remain: return all solutions',
  '        backtrack to retry the last choice point',
  '    else',
  '        goal ← top of goals',
  '        if goal has no choice point yet',
  '            create choice point: clauses matching goal',
  '        if remaining clauses is empty',
  '            discard exhausted choice point',
  '            if no choice points remain: return failure',
  '            backtrack',
  '        else',
  '            clause ← next remaining clause, with fresh variables',
  '            if unify(goal, clause.head) succeeds',
  '                replace goal with clause.body on the goal stack',
  '            else',
  '                try the next clause',
]

interface InternalChoicePoint {
  frameId: string
  term: Term
  goalsSnapshot: GoalFrame[]
  bindingsSnapshot: Bindings
  remainingClauses: Clause[]
}

function formatBindings(queryVars: string[], bindings: Bindings): string {
  const parts = queryVars.map((name) => `${name} = ${termToString(v(name), bindings)}`)
  return parts.length > 0 ? parts.join(', ') : 'true'
}

function queryBindingsSnapshot(
  queryVars: string[],
  bindings: Bindings,
): Record<string, Term | null> {
  const result: Record<string, Term | null> = {}
  for (const name of queryVars) {
    const resolved = resolveTerm(v(name), bindings)
    result[name] = resolved.kind === 'var' ? null : resolved
  }
  return result
}

const MAX_STEPS = 2000

export function solveProlog(database: Clause[], query: Term): ProofStep[] {
  const steps: ProofStep[] = []
  const queryVars = [...variablesIn(query)]

  let frameCounter = 1
  let goals: GoalFrame[] = [{ id: 'g0', term: query }]
  let bindings: Bindings = {}
  const choicePoints: InternalChoicePoint[] = []
  const solutions: Record<string, Term>[] = []

  const treeNodes = new Map<string, ProofTreeNode>()
  const treeEdges: { id: string; source: string; target: string }[] = []
  treeNodes.set('g0', { id: 'g0', term: query, parentId: null, status: 'pending' })

  function setStatus(id: string, status: ProofTreeNode['status']): void {
    const node = treeNodes.get(id)
    if (node) treeNodes.set(id, { ...node, status })
  }

  function snapshotState(currentGoalId: string | null): ProofState {
    return {
      goals: [...goals],
      currentGoalId,
      bindings: { ...bindings },
      queryBindings: queryBindingsSnapshot(queryVars, bindings),
      choicePoints: choicePoints.map<ChoicePointView>((cp) => ({
        goalId: cp.frameId,
        term: cp.term,
        remaining: cp.remainingClauses.length,
      })),
      solutions: [...solutions],
      done: false,
      treeNodes: [...treeNodes.values()],
      treeEdges: [...treeEdges],
    }
  }

  function pushStep(activePseudocodeLine: number, explanation: ReturnType<typeof msg>, traceEntry: ReturnType<typeof msg>, currentGoalId: string | null = null): void {
    steps.push({ state: snapshotState(currentGoalId), activePseudocodeLine, explanation, traceEntry })
  }

  /** Unwinds the choice-point stack, discarding exhausted ones, and restores
   *  the goal stack + bindings from the next usable one. Returns false if
   *  the search is entirely exhausted. */
  function backtrack(): boolean {
    while (choicePoints.length > 0) {
      const top = choicePoints[choicePoints.length - 1]
      if (top.remainingClauses.length === 0) {
        choicePoints.pop()
        // Everything created after this choice point belongs to an
        // abandoned branch — mark it (and this exhausted goal itself, which
        // may have previously succeeded before its own subtree dead-ended)
        // so, unless it already failed outright.
        for (const node of treeNodes.values()) {
          const num = Number(node.id.slice(1))
          if (num >= Number(top.frameId.slice(1)) && node.status !== 'failed') {
            setStatus(node.id, 'backtracked')
          }
        }
        continue
      }
      goals = [...top.goalsSnapshot]
      bindings = top.bindingsSnapshot
      for (const node of treeNodes.values()) {
        const num = Number(node.id.slice(1))
        if (num > Number(top.frameId.slice(1)) && node.status !== 'failed') {
          setStatus(node.id, 'backtracked')
        }
      }
      pushStep(
        15,
        msg('prolog.backtrack', { goal: termToString(top.term, bindings) }),
        msg('prolog.backtrack.trace', { goal: termToString(top.term, bindings) }),
        top.frameId,
      )
      return true
    }
    return false
  }

  pushStep(1, msg('prolog.init', { query: termToString(query) }), msg('prolog.init.trace', { query: termToString(query) }))

  while (steps.length < MAX_STEPS) {
    if (goals.length === 0) {
      const solution = Object.fromEntries(
        queryVars.map((name) => [name, resolveTerm(v(name), bindings)]),
      )
      solutions.push(solution)
      pushStep(
        5,
        msg('prolog.solutionFound', { bindings: formatBindings(queryVars, bindings) }),
        msg('prolog.solutionFound.trace', { bindings: formatBindings(queryVars, bindings) }),
      )
      if (!backtrack()) {
        const state = snapshotState(null)
        steps.push({
          state: { ...state, done: true },
          activePseudocodeLine: 6,
          explanation:
            solutions.length > 0
              ? msg('prolog.exhaustedWithSolutions', { count: solutions.length })
              : msg('prolog.exhaustedNoSolutions'),
          traceEntry:
            solutions.length > 0
              ? msg('prolog.exhaustedWithSolutions.trace', { count: solutions.length })
              : msg('prolog.exhaustedNoSolutions.trace'),
        })
        break
      }
      continue
    }

    const frame = goals[goals.length - 1]
    let cp = choicePoints[choicePoints.length - 1]

    if (!cp || cp.frameId !== frame.id) {
      const matching = database.filter((c) => {
        try {
          return signature(c.head) === signature(walk(frame.term, bindings))
        } catch {
          return false
        }
      })
      cp = {
        frameId: frame.id,
        term: frame.term,
        goalsSnapshot: [...goals],
        bindingsSnapshot: bindings,
        remainingClauses: matching,
      }
      choicePoints.push(cp)
      setStatus(frame.id, 'current')
      pushStep(
        11,
        msg('prolog.selectGoal', {
          goal: termToString(frame.term, bindings),
          count: matching.length,
        }),
        msg('prolog.selectGoal.trace', { goal: termToString(frame.term, bindings) }),
        frame.id,
      )
    }

    if (cp.remainingClauses.length === 0) {
      setStatus(frame.id, 'failed')
      pushStep(
        13,
        msg('prolog.noMoreClauses', { goal: termToString(frame.term, bindings) }),
        msg('prolog.noMoreClauses.trace', { goal: termToString(frame.term, bindings) }),
        frame.id,
      )
      if (!backtrack()) {
        const state = snapshotState(null)
        steps.push({
          state: { ...state, done: true },
          activePseudocodeLine: 14,
          explanation:
            solutions.length > 0
              ? msg('prolog.exhaustedWithSolutions', { count: solutions.length })
              : msg('prolog.exhaustedNoSolutions'),
          traceEntry:
            solutions.length > 0
              ? msg('prolog.exhaustedWithSolutions.trace', { count: solutions.length })
              : msg('prolog.exhaustedNoSolutions.trace'),
        })
        break
      }
      continue
    }

    const clause = cp.remainingClauses.shift()!
    const renamed = renameClause(clause, String(frameCounter++))
    const attempt = unify(frame.term, renamed.head, bindings)

    if (!attempt) {
      const clauseText = termToString(renamed.head, bindings)
      pushStep(
        19,
        msg('prolog.unifyFail', { goal: termToString(frame.term, bindings), clause: clauseText }),
        msg('prolog.unifyFail.trace', { goal: termToString(frame.term, bindings), clause: clauseText }),
        frame.id,
      )
      continue
    }

    const goalText = termToString(frame.term, attempt)
    const clauseText = termToString(renamed.head, attempt)
    bindings = attempt
    goals = goals.slice(0, -1)
    setStatus(frame.id, 'success')

    const newFrames: GoalFrame[] = renamed.body.map((term) => ({
      id: `g${frameCounter++}`,
      term,
    }))
    for (const nf of newFrames) {
      treeNodes.set(nf.id, { id: nf.id, term: nf.term, parentId: frame.id, status: 'pending' })
      treeEdges.push({ id: `${frame.id}-${nf.id}`, source: frame.id, target: nf.id })
    }
    // Push in reverse so the leftmost body goal ends on top (solved first).
    goals = [...goals, ...newFrames.slice().reverse()]

    pushStep(
      18,
      msg('prolog.unifySuccess', {
        goal: goalText,
        clause: clauseText,
        bindings: formatBindings(queryVars, bindings),
      }),
      msg('prolog.unifySuccess.trace', { goal: goalText, clause: clauseText }),
      frame.id,
    )

    if (newFrames.length > 0) {
      const list = newFrames.map((f) => termToString(f.term, bindings)).join(', ')
      pushStep(18, msg('prolog.pushBody', { list }), msg('prolog.pushBody.trace', { list }), frame.id)
    }
  }

  return steps
}

/**
 * Minimal Prolog term representation: atoms, variables, and compound terms
 * (functor + arguments). No lists/operators/arithmetic — just enough to
 * demonstrate unification, resolution, and backtracking clearly.
 */
export type Term =
  | { kind: 'atom'; name: string }
  | { kind: 'var'; name: string }
  | { kind: 'compound'; functor: string; args: Term[] }

export interface Clause {
  head: Term
  /** Goals to prove for this clause to hold. Empty body = fact. */
  body: Term[]
}

export type Bindings = Readonly<Record<string, Term>>

export function atom(name: string): Term {
  return { kind: 'atom', name }
}

export function v(name: string): Term {
  return { kind: 'var', name }
}

export function compound(functor: string, args: Term[]): Term {
  return { kind: 'compound', functor, args }
}

export function fact(functor: string, ...args: Term[]): Clause {
  return { head: compound(functor, args), body: [] }
}

export function rule(head: Term, ...body: Term[]): Clause {
  return { head, body }
}

/** Functor/arity signature used to look up candidate clauses for a goal. */
export function signature(term: Term): string {
  if (term.kind === 'compound') return `${term.functor}/${term.args.length}`
  if (term.kind === 'atom') return `${term.name}/0`
  throw new Error('A variable has no functor/arity signature')
}

/** Resolves a variable through the binding chain until it is not bound further. */
export function walk(term: Term, bindings: Bindings): Term {
  while (term.kind === 'var' && term.name in bindings) {
    term = bindings[term.name]
  }
  return term
}

/** Fully substitutes bound variables, recursively, for display purposes. */
export function resolveTerm(term: Term, bindings: Bindings): Term {
  const resolved = walk(term, bindings)
  if (resolved.kind === 'compound') {
    return { ...resolved, args: resolved.args.map((a) => resolveTerm(a, bindings)) }
  }
  return resolved
}

export function termToString(term: Term, bindings: Bindings = {}): string {
  const resolved = resolveTerm(term, bindings)
  if (resolved.kind === 'atom') return resolved.name
  if (resolved.kind === 'var') return resolved.name
  if (resolved.args.length === 0) return resolved.functor
  return `${resolved.functor}(${resolved.args.map((a) => termToString(a, bindings)).join(', ')})`
}

export function clauseToString(clause: Clause): string {
  const head = termToString(clause.head)
  if (clause.body.length === 0) return `${head}.`
  return `${head} :- ${clause.body.map((g) => termToString(g)).join(', ')}.`
}

/** Renames every variable in a clause to a fresh, globally unique name. */
export function renameClause(clause: Clause, suffix: string): Clause {
  const mapping = new Map<string, Term>()
  function rename(term: Term): Term {
    if (term.kind === 'var') {
      if (!mapping.has(term.name)) mapping.set(term.name, v(`${term.name}#${suffix}`))
      return mapping.get(term.name)!
    }
    if (term.kind === 'compound') return compound(term.functor, term.args.map(rename))
    return term
  }
  return { head: rename(clause.head), body: clause.body.map(rename) }
}

/** Collects the distinct variable names appearing in a term. */
export function variablesIn(term: Term, into: Set<string> = new Set()): Set<string> {
  if (term.kind === 'var') into.add(term.name)
  else if (term.kind === 'compound') for (const a of term.args) variablesIn(a, into)
  return into
}

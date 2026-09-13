import type { Bindings, Term } from './terms'
import { walk } from './terms'

/**
 * Attempts to unify two terms under the given bindings, returning the
 * extended bindings on success or `null` on failure. Bindings are never
 * mutated — each successful step returns a brand-new object — which is
 * exactly what makes backtracking trivial: a choice point simply keeps a
 * reference to the bindings snapshot from before the attempt, and
 * "backtracking" is just resuming from that reference.
 */
export function unify(a: Term, b: Term, bindings: Bindings): Bindings | null {
  const left = walk(a, bindings)
  const right = walk(b, bindings)

  if (left.kind === 'var' && right.kind === 'var' && left.name === right.name) {
    return bindings
  }
  if (left.kind === 'var') {
    return { ...bindings, [left.name]: right }
  }
  if (right.kind === 'var') {
    return { ...bindings, [right.name]: left }
  }
  if (left.kind === 'atom' && right.kind === 'atom') {
    return left.name === right.name ? bindings : null
  }
  if (left.kind === 'compound' && right.kind === 'compound') {
    if (left.functor !== right.functor || left.args.length !== right.args.length) return null
    let result: Bindings = bindings
    for (let i = 0; i < left.args.length; i++) {
      const next = unify(left.args[i], right.args[i], result)
      if (!next) return null
      result = next
    }
    return result
  }
  return null
}

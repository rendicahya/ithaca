import type { Clause } from './terms'
import { atom, compound, fact, rule, v } from './terms'

/**
 * A small family-tree knowledge base — the classic first Prolog example.
 * The default query, grandparent(tom, X), needs real backtracking to find
 * both of its solutions:
 *
 *   parent(tom, Y), parent(Y, Z)
 *
 *  - Y = bob (first parent(tom, _) match)
 *      - Z = ann  → solution X = ann
 *      - Z = pat  → solution X = pat   (found by backtracking into parent(bob, _))
 *  - Y = liz (backtracking into parent(tom, _) again)
 *      - parent(liz, _) has no facts → this branch fails
 *
 * So the engine tries three branches, two of which succeed and one of
 * which fails outright — a compact but genuine demonstration of
 * backtracking through both facts and rules.
 */
export const defaultDatabase: Clause[] = [
  fact('parent', atom('tom'), atom('bob')),
  fact('parent', atom('tom'), atom('liz')),
  fact('parent', atom('bob'), atom('ann')),
  fact('parent', atom('bob'), atom('pat')),
  fact('parent', atom('pat'), atom('jim')),

  rule(
    compound('grandparent', [v('X'), v('Z')]),
    compound('parent', [v('X'), v('Y')]),
    compound('parent', [v('Y'), v('Z')]),
  ),
]

export const defaultQuery = compound('grandparent', [atom('tom'), v('X')])

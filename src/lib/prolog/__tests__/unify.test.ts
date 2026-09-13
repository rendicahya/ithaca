import { describe, expect, it } from 'vitest'

import { atom, compound, termToString, v } from '../terms'
import { unify } from '../unify'

describe('unify', () => {
  it('unifies identical atoms', () => {
    expect(unify(atom('tom'), atom('tom'), {})).toEqual({})
  })

  it('fails on different atoms', () => {
    expect(unify(atom('tom'), atom('bob'), {})).toBeNull()
  })

  it('binds an unbound variable to an atom', () => {
    const result = unify(v('X'), atom('tom'), {})
    expect(result).not.toBeNull()
    expect(termToString(v('X'), result!)).toBe('tom')
  })

  it('unifies two variables together', () => {
    const result = unify(v('X'), v('Y'), {})
    expect(result).not.toBeNull()
  })

  it('unifies compound terms structurally, binding variables along the way', () => {
    const goal = compound('parent', [atom('tom'), v('Y')])
    const fact = compound('parent', [atom('tom'), atom('bob')])
    const result = unify(goal, fact, {})
    expect(result).not.toBeNull()
    expect(termToString(v('Y'), result!)).toBe('bob')
  })

  it('fails when functors differ', () => {
    const a = compound('parent', [atom('tom'), atom('bob')])
    const b = compound('sibling', [atom('tom'), atom('bob')])
    expect(unify(a, b, {})).toBeNull()
  })

  it('fails when arities differ', () => {
    const a = compound('parent', [atom('tom')])
    const b = compound('parent', [atom('tom'), atom('bob')])
    expect(unify(a, b, {})).toBeNull()
  })

  it('propagates bindings across multiple arguments', () => {
    const goal = compound('pair', [v('X'), v('X')])
    const fact = compound('pair', [atom('a'), atom('a')])
    expect(unify(goal, fact, {})).not.toBeNull()

    const mismatched = compound('pair', [atom('a'), atom('b')])
    expect(unify(goal, mismatched, {})).toBeNull()
  })
})

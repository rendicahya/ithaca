import type { Graph } from './types'

/**
 * The shared classroom search graph used by BFS, DFS, UCS, Greedy Best-First
 * Search, and A*. Positions, costs, and heuristics are hand-tuned (not
 * auto-laid-out) so the same graph can visibly distinguish each algorithm's
 * behavior when a lecturer resets and switches between them:
 *
 *  - BFS   finds S-A-D-G   (cost 15, fewest edges — ignores cost)
 *  - DFS   finds S-A-C-F-G (cost 12, depth-first order — not optimal)
 *  - UCS   finds S-B-D-F-G (cost 11, optimal — orders by g(n))
 *  - Greedy finds S-B-E-G  (cost 12, misled by a low h(E) — ignores g(n))
 *  - A*    finds S-B-D-F-G (cost 11, optimal — g(n) + h(n) corrects for the
 *          misleading heuristic that fools Greedy)
 *
 * All heuristic values are admissible (h(n) <= true remaining cost to G),
 * which is what guarantees A* stays optimal despite being deliberately
 * unhelpful for individual nodes (see h(A) and h(E)).
 */
export const defaultGraph: Graph = {
  start: 'S',
  goal: 'G',
  nodes: [
    { id: 'S', label: 'S', x: 40, y: 220, heuristic: 9 },
    { id: 'A', label: 'A', x: 220, y: 80, heuristic: 8 },
    { id: 'B', label: 'B', x: 220, y: 360, heuristic: 3 },
    { id: 'C', label: 'C', x: 400, y: 20, heuristic: 6 },
    { id: 'D', label: 'D', x: 400, y: 220, heuristic: 5 },
    { id: 'E', label: 'E', x: 400, y: 420, heuristic: 2 },
    { id: 'F', label: 'F', x: 580, y: 140, heuristic: 3 },
    { id: 'G', label: 'G', x: 760, y: 220, heuristic: 0 },
  ],
  edges: [
    { id: 'S-A', source: 'S', target: 'A', cost: 2 },
    { id: 'S-B', source: 'S', target: 'B', cost: 4 },
    { id: 'A-C', source: 'A', target: 'C', cost: 3 },
    { id: 'A-D', source: 'A', target: 'D', cost: 5 },
    { id: 'B-D', source: 'B', target: 'D', cost: 2 },
    { id: 'B-E', source: 'B', target: 'E', cost: 5 },
    { id: 'C-F', source: 'C', target: 'F', cost: 4 },
    { id: 'D-F', source: 'D', target: 'F', cost: 2 },
    { id: 'D-G', source: 'D', target: 'G', cost: 8 },
    { id: 'E-G', source: 'E', target: 'G', cost: 3 },
    { id: 'F-G', source: 'F', target: 'G', cost: 3 },
  ],
}

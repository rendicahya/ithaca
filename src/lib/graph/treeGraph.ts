import type { Graph } from './types'

/**
 * A pure binary tree — exactly one path between any two nodes — used
 * specifically to make the BFS vs. DFS contrast obvious. On a graph with
 * multiple paths (see defaultGraph.ts), the interesting difference is which
 * path each algorithm finds. On a tree there is only one possible path, so
 * the only thing left to observe is *the order nodes are visited in*:
 *
 *  - BFS explores level by level. The goal, B, is the right child of the
 *    root, so BFS reaches it on its 3rd dequeue (S, A, B) — it barely has
 *    to look past the first level.
 *  - DFS commits to the left child first and dives all the way to the
 *    bottom of A's entire subtree (A, C, G, H, D, I, J — 7 nodes) before
 *    ever backtracking to try B, reaching the same goal only on its 9th pop.
 *
 * Same goal, same unique path, wildly different amount of work — because
 * of *how* each algorithm explores, not what it's looking for.
 *
 * Heuristic values are the exact tree-distance (edge count) to the goal B,
 * so Greedy/UCS/A* remain well-defined here too, even though this example's
 * purpose is the BFS/DFS comparison rather than cost or heuristic behavior.
 */
export const treeGraph: Graph = {
  start: 'S',
  goal: 'B',
  layout: 'vertical',
  nodes: [
    { id: 'S', label: 'S', x: 440, y: 30, heuristic: 1 },
    { id: 'A', label: 'A', x: 220, y: 150, heuristic: 2 },
    { id: 'B', label: 'B', x: 660, y: 150, heuristic: 0 },
    { id: 'C', label: 'C', x: 110, y: 270, heuristic: 3 },
    { id: 'D', label: 'D', x: 330, y: 270, heuristic: 3 },
    { id: 'E', label: 'E', x: 550, y: 270, heuristic: 1 },
    { id: 'F', label: 'F', x: 770, y: 270, heuristic: 1 },
    { id: 'G', label: 'G', x: 55, y: 390, heuristic: 4 },
    { id: 'H', label: 'H', x: 165, y: 390, heuristic: 4 },
    { id: 'I', label: 'I', x: 275, y: 390, heuristic: 4 },
    { id: 'J', label: 'J', x: 385, y: 390, heuristic: 4 },
    { id: 'K', label: 'K', x: 495, y: 390, heuristic: 2 },
    { id: 'L', label: 'L', x: 605, y: 390, heuristic: 2 },
    { id: 'M', label: 'M', x: 715, y: 390, heuristic: 2 },
    { id: 'N', label: 'N', x: 825, y: 390, heuristic: 2 },
  ],
  edges: [
    { id: 'S-A', source: 'S', target: 'A', cost: 1 },
    { id: 'S-B', source: 'S', target: 'B', cost: 1 },
    { id: 'A-C', source: 'A', target: 'C', cost: 1 },
    { id: 'A-D', source: 'A', target: 'D', cost: 1 },
    { id: 'B-E', source: 'B', target: 'E', cost: 1 },
    { id: 'B-F', source: 'B', target: 'F', cost: 1 },
    { id: 'C-G', source: 'C', target: 'G', cost: 1 },
    { id: 'C-H', source: 'C', target: 'H', cost: 1 },
    { id: 'D-I', source: 'D', target: 'I', cost: 1 },
    { id: 'D-J', source: 'D', target: 'J', cost: 1 },
    { id: 'E-K', source: 'E', target: 'K', cost: 1 },
    { id: 'E-L', source: 'E', target: 'L', cost: 1 },
    { id: 'F-M', source: 'F', target: 'M', cost: 1 },
    { id: 'F-N', source: 'F', target: 'N', cost: 1 },
  ],
}

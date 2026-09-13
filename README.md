# Ithaca

Interactive AI teaching platform for visualizing algorithms, pseudocode, and step-by-step reasoning.

Ithaca is a classroom-oriented teaching tool for university AI courses. Its central principle:

> **Show the reasoning process, not only the final answer.**

Instead of just displaying a final path or answer, Ithaca makes every intermediate decision visible — the current frontier, why a node was chosen, how the pseudocode maps to execution, and how the answer was actually reached.

**[Live demo →](https://rendicahya.github.io/ithaca/)**

## Features

- **Step-by-step execution** — Step Forward / Step Backward / Run / Pause / Reset, all backed by precomputed, deterministic execution snapshots so backward stepping is exact.
- **Synchronized views** — the graph, state panel, pseudocode (active-line highlighted), step explanation, and decision trace all update together for every step.
- **Presenter-first controls** — Page Up / Page Down drive stepping directly, so a lecturer can run the whole class from a presentation remote. Full keyboard shortcut list via `?`.
- **Two graph examples**:
  - **Weighted Graph** — multiple paths with different costs and heuristics, tuned so BFS, DFS, UCS, Greedy, and A* each find a genuinely different path.
  - **Tree** — a single path to every node, isolating the difference in *traversal order* between BFS (level-by-level) and DFS (depth-first, with backtracking).
- **Light / dark theme**, fullscreen presentation mode, and a layout designed for classroom projectors.

## Algorithms

| Algorithm | Frontier | Notes |
|---|---|---|
| Breadth-First Search | FIFO queue | Not cost-sensitive — finds the fewest-edges path |
| Depth-First Search | LIFO stack | Not generally optimal |
| Uniform-Cost Search | Priority queue by `g(n)` | Optimal by path cost |
| Greedy Best-First Search | Priority queue by `h(n)` | Ignores path cost so far — can be misled |
| A* Search | Priority queue by `f(n) = g(n) + h(n)` | Optimal given an admissible heuristic |

All five share one execution engine and one graph visualization, so a lecturer can reset and switch algorithms to compare behavior directly on the same example.

## Tech stack

- [Svelte 5](https://svelte.dev/) + TypeScript + [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn-svelte](https://www.shadcn-svelte.com/)-style primitives on [bits-ui](https://bits-ui.com/)
- [Svelte Flow](https://svelteflow.dev/) (`@xyflow/svelte`) for graph visualization
- [Lucide](https://lucide.dev/) icons
- [Vitest](https://vitest.dev/) for algorithm correctness tests

Ithaca is a frontend-only static app — no backend, no server-side rendering.

## Getting started

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build   # production build to dist/
npm run preview # preview the production build locally
npm run check   # svelte-check + TypeScript project check
npm test        # run the algorithm test suite (Vitest)
```

## Project structure

```text
src/
├── lib/
│   ├── algorithms/search/   # BFS, DFS, UCS, Greedy, A* — pure functions, UI-independent
│   ├── execution/           # Step controller: forward/backward/run/pause/reset
│   ├── graph/               # Graph types + the two teaching examples
│   ├── shortcuts/           # Centralized keyboard shortcut dispatch
│   └── theme/                # Light/dark theme store
└── components/
    ├── layout/              # App shell, header, sidebar, theme/fullscreen toggles
    ├── visualization/       # Svelte Flow graph, custom node/edge components
    ├── state/               # Queue/Stack/PriorityQueue views
    ├── pseudocode/          # Active-line pseudocode panel
    ├── trace/               # Step explanation + decision trace
    ├── execution/           # Playback controls, shortcuts help dialog
    └── ui/                  # Reusable primitives (Button, Dialog, Tooltip, ...)
```

Algorithm logic is fully decoupled from the UI and tested independently — see `src/lib/algorithms/search/__tests__`.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Page Down` / `→` | Step forward |
| `Page Up` / `←` | Step backward |
| `Space` | Run / Pause |
| `R` | Reset |
| `?` | Show shortcuts |
| `Esc` | Close dialog / exit fullscreen |

## Deployment

Pushing to `main` builds and deploys the app to GitHub Pages automatically via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Roadmap

Search algorithms are the first of several planned AI topics: Genetic Algorithm, Propositional Logic, First-Order Logic, Prolog, K-Nearest Neighbor, and Naïve Bayes — sharing the same execution and visualization architecture.

## License

MIT — see [LICENSE](LICENSE).

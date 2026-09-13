# Ithaca

## 1. Project Overview

**Ithaca** is a professional, interactive AI teaching environment for university classrooms.

Ithaca is designed to make algorithms and their reasoning visible.

The central product principle is:

> **Show the reasoning process, not only the final answer.**

The desired student reaction is:

> **“I can see why the algorithm did that.”**

Ithaca is not merely a collection of algorithm demos. It is a classroom-oriented teaching tool where students can observe:

* what the algorithm is doing,
* what state it currently has,
* why it makes a particular decision,
* how its data structures change,
* how pseudocode corresponds to execution,
* and how the final result is produced.

The application should feel like a polished academic teaching product rather than a toy, game, or generic algorithm visualizer.

---

# 2. Technology Stack

Ithaca is a frontend-only web application.

## Core

* Svelte
* TypeScript
* Vite

## UI / Styling

* Tailwind CSS
* shadcn-svelte
* Lucide

## Visualization

* Svelte Flow (`@xyflow/svelte`) for graph-based visualization
* Dagre only when automatic graph layout is actually useful

## Testing

* Vitest for algorithm/unit testing
* Playwright may be used for end-to-end testing when needed

Do not introduce additional libraries unless there is a clear technical or pedagogical reason.

Prefer the existing stack over adding another dependency.

---

# 3. Library Responsibilities

## Svelte

Use Svelte for:

* component architecture,
* application state,
* reactive UI,
* interaction,
* page/module composition.

Keep components focused and reusable.

Do not put algorithm implementations directly inside large UI components.

---

## TypeScript

Use TypeScript throughout the application.

Prefer:

* explicit types,
* discriminated unions where appropriate,
* typed algorithm state,
* typed execution steps,
* typed visualization state.

Avoid unnecessary `any`.

Algorithm state should be predictable and easy to inspect.

---

## Vite

Use Vite as the development and production build system.

The application must remain compatible with deployment to GitHub Pages.

Do not introduce server-side dependencies unless the project requirements explicitly change.

---

# 4. Svelte Flow

Use **Svelte Flow (`@xyflow/svelte`)** as the main infrastructure for graph-based visualizations.

Svelte Flow should be used for:

* graph rendering,
* node positioning,
* edges,
* pan,
* zoom,
* graph interaction,
* custom nodes,
* custom edges when necessary.

Create custom Svelte Flow nodes for Ithaca's educational requirements.

A graph node may display information such as:

* node label,
* visited/explored state,
* frontier state,
* current state,
* `g(n)`,
* `h(n)`,
* `f(n)`,
* parent,
* selected status.

Edges may display:

* edge cost,
* traversal state,
* path membership.

Do not use Svelte Flow merely as a decorative graph renderer.

The graph must communicate algorithmic state.

### Important

The default classroom graph should use deliberately chosen positions.

Do not automatically rearrange the graph on every algorithm execution.

The geometry of the graph is part of the teaching design.

Automatic layout should only be used when it improves usability or for future user-created/dynamic graphs.

---

# 5. Dagre

Dagre is optional.

Use Dagre only when automatic graph layout is actually useful.

Potential use cases:

* automatically laying out user-created graphs,
* generating hierarchical graphs,
* preparing dynamically generated examples,
* avoiding manual positioning for future modules.

Do not use Dagre to replace carefully designed positions in the default teaching examples.

For the default search demonstration, stable manually designed positions are preferred because students should be able to compare algorithms on exactly the same graph.

Do not add layout complexity unless it provides clear value.

---

# 6. Tailwind CSS

Use Tailwind CSS as the primary styling system.

Prefer utility classes and shared design patterns over large amounts of custom CSS.

Tailwind should provide:

* spacing,
* typography,
* layout,
* responsive behavior,
* borders,
* backgrounds,
* states,
* sizing,
* dark mode,
* visual hierarchy.

Do not create excessive one-off styles.

Use semantic and consistent spacing.

The application should look intentionally designed rather than like a collection of Tailwind utilities.

---

# 7. shadcn-svelte

Use shadcn-svelte for reusable interface primitives where appropriate.

Potential components include:

* Button
* Tooltip
* Dropdown Menu
* Dialog
* Select
* Slider
* Tabs
* Separator
* Badge
* Scroll Area
* Toggle
* Switch

Use shadcn-svelte to establish consistent interaction patterns.

Do not use components simply because they exist.

Avoid unnecessary abstraction.

For highly specialized educational visualization components, custom Svelte components are preferable.

---

# 8. Lucide

Use Lucide icons for interface icons.

Examples:

* play
* pause
* skip forward
* skip backward
* rotate/reset
* fullscreen
* sun/moon
* settings
* keyboard shortcuts
* chevrons
* navigation controls

Do not use arbitrary Unicode symbols as UI icons when a suitable Lucide icon exists.

Icons should support comprehension rather than decorate the interface.

---

# 9. Product Philosophy

Ithaca should prioritize:

1. Reasoning visibility
2. Pedagogical clarity
3. Algorithm correctness
4. Visual clarity
5. Classroom usability
6. Interaction quality
7. Professional appearance
8. Maintainable architecture

Do not prioritize:

* flashy animations,
* unnecessary effects,
* excessive dependencies,
* decorative UI,
* complexity for its own sake.

---

# 10. Target Environment

Ithaca is primarily designed for university classroom teaching.

The lecturer may project Ithaca on a large screen.

Therefore:

* text must be readable,
* controls must be obvious,
* state changes must be visually clear,
* contrast must be strong,
* animations must not be distracting,
* important information must not be hidden behind tiny UI elements.

The UI should work well at normal desktop/laptop resolutions and classroom projectors.

---

# 11. Application Layout

The preferred application structure is:

```text
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
│ Ithaca                     Theme   Fullscreen               │
├──────────────┬───────────────────────────┬──────────────────┤
│ Navigation   │ Main Visualization        │ State Panel      │
│              │                           │                  │
│              │                           │                  │
├──────────────┴───────────────────────────┴──────────────────┤
│ Pseudocode                                                   │
├─────────────────────────────────────────────────────────────┤
│ Execution Controls                                          │
└─────────────────────────────────────────────────────────────┘
```

The exact implementation may evolve, but the information hierarchy should remain.

The main visualization is the primary content.

The application should avoid unnecessary scrolling during normal desktop use.

---

# 12. Main UI Areas

The application should eventually contain reusable components such as:

```text
AppShell
Header
Sidebar
ThemeToggle
FullscreenToggle

GraphView
GraphNode
GraphEdge

StatePanel
QueueView
StackView
PriorityQueueView

PseudocodePanel
StepExplanation
DecisionTrace

ExecutionControls
KeyboardShortcutHelp
```

Components may be renamed or reorganized if the architecture improves.

Do not create components solely for the sake of component count.

---

# 13. Navigation

Ithaca will eventually contain multiple AI topics.

Initial topics:

* BFS
* DFS
* UCS
* Greedy Best-First Search
* A* Search
* Genetic Algorithm
* Propositional Logic
* First-Order Logic
* Prolog
* K-Nearest Neighbor
* Naïve Bayes

Navigation should make it easy for a lecturer to switch between topics.

The navigation should feel like an academic teaching environment, not a game menu.

---

# 14. Search Algorithms

The first major family of visualizations is graph search.

Algorithms:

* Breadth-First Search (BFS)
* Depth-First Search (DFS)
* Uniform-Cost Search (UCS)
* Greedy Best-First Search
* A* Search

All algorithms should share a common graph visualization infrastructure.

They should also share a common execution architecture.

---

# 15. Common Search Graph

The default search graph should be deliberately designed for teaching.

It should contain:

* multiple paths,
* branching,
* different path lengths,
* different edge costs,
* meaningful heuristic values,
* enough complexity to distinguish the algorithms,
* but remain small enough to understand on a projector.

The same graph should be usable across:

* BFS,
* DFS,
* UCS,
* Greedy Best-First Search,
* A*.

The following should remain consistent:

* node positions,
* start node,
* goal node,
* edges,
* edge costs,
* heuristic values.

This allows a lecturer to reset and switch algorithms while comparing their behavior directly.

The graph should demonstrate concepts such as:

* BFS is not cost-sensitive,
* DFS is not generally optimal,
* UCS considers path cost,
* Greedy considers heuristic only,
* A* combines path cost and heuristic.

---

# 16. BFS Visualization

BFS uses a FIFO queue.

The visualization should clearly show:

* current node,
* queue,
* visited/explored nodes,
* newly discovered nodes,
* parent relationships,
* current path,
* final path,
* path cost.

Queue visualization should show:

* front,
* back,
* enqueue,
* dequeue.

Example explanation:

> “BFS removes A from the front of the queue.”

Example trace:

```text
Dequeue S
Expand S
Enqueue A, B
Dequeue A
Expand A
Enqueue C, D
...
```

Pseudocode must highlight the currently executing line.

---

# 17. DFS Visualization

DFS uses a LIFO stack.

The visualization should clearly show:

* current node,
* stack,
* visited/explored nodes,
* newly discovered nodes,
* parent relationships,
* current path,
* final path,
* path cost.

Stack visualization should show:

* top,
* push,
* pop.

Example explanation:

> “DFS pops C from the top of the stack.”

Example trace:

```text
Pop S
Expand S
Push B, A
Pop A
Expand A
Push D, C
...
```

The exact ordering should follow the implementation consistently and be pedagogically explainable.

---

# 18. UCS Visualization

UCS uses a priority queue ordered by:

```text
g(n)
```

where `g(n)` is the path cost from the start node.

The UI should make the ordering visible.

Example:

```text
Priority Queue

B   g=3
C   g=5
D   g=8
```

Example explanation:

> “UCS selects B because it has the smallest path cost g(n).”

The visualization must clearly distinguish UCS from BFS.

---

# 19. Greedy Best-First Search Visualization

Greedy Best-First Search uses a priority queue ordered by:

```text
h(n)
```

where `h(n)` is the heuristic estimate to the goal.

Example explanation:

> “Greedy selects D because h(D) is the smallest.”

The UI should emphasize that Greedy does not directly optimize the path cost accumulated so far.

---

# 20. A* Visualization

A* uses:

```text
f(n) = g(n) + h(n)
```

The visualization must make all three values visible where useful:

```text
g(n)
h(n)
f(n)
```

Example:

```text
C
g = 4
h = 3
f = 7
```

Example explanation:

> “A* selects C because f(C) = g(C) + h(C) is minimal.”

Students should be able to visually understand how A* balances:

* cost already spent,
* estimated remaining cost.

---

# 21. Search State

Search algorithms should expose explicit state.

A generic search state may contain:

```ts
type SearchState = {
  currentNode: string | null
  frontier: string[]
  visited: string[]
  path: string[]
  pathCost: number
}
```

The exact data structure may differ by algorithm.

Additional state may include:

```ts
gScore
hScore
fScore
parent
status
```

Do not force all algorithms into an artificial identical internal representation.

Share infrastructure where appropriate while preserving algorithm-specific logic.

---

# 22. State Panel

The State Panel should answer:

> “What is the algorithm's state right now?”

Depending on the algorithm, show:

* current node,
* frontier,
* visited nodes,
* queue,
* stack,
* priority queue,
* path,
* path cost,
* heuristic,
* evaluation function,
* selected node,
* relevant algorithm-specific values.

Avoid overwhelming the student with irrelevant information.

The displayed state should correspond exactly to the current execution step.

---

# 23. Decision Explanation

Every meaningful algorithmic decision should have a concise natural-language explanation.

Examples:

```text
BFS removes A from the front of the queue.
```

```text
DFS pops C from the top of the stack.
```

```text
UCS selects B because g(B) = 3 is the smallest path cost.
```

```text
Greedy selects D because h(D) = 2 is the smallest heuristic.
```

```text
A* selects C because f(C) = g(C) + h(C) = 7 is minimal.
```

The explanation should update with each execution step.

This is a central pedagogical feature.

---

# 24. Decision Trace

Show a concise history of algorithm decisions.

Example:

```text
1. Dequeue S
2. Expand S
3. Enqueue A, B
4. Dequeue A
5. Expand A
6. Enqueue C, D
```

For priority-queue algorithms:

```text
1. Select S because f(S) = 0
2. Expand S
3. Insert A with f(A) = 5
4. Insert B with f(B) = 3
5. Select B because f(B) is minimal
```

The trace should help students reconstruct the reasoning.

---

# 25. Pseudocode

Pseudocode is a first-class part of Ithaca.

Every algorithm visualization should have corresponding pseudocode.

Requirements:

* line numbers,
* syntax-like formatting,
* active-line highlighting,
* clear indentation,
* readable projector typography.

Use **JetBrains Mono** for pseudocode.

The active pseudocode line should correspond to the current execution step.

Example:

```text
1  while frontier is not empty
2      node ← remove(frontier)
3      if node is goal
4          return solution
5      expand(node)
```

When the algorithm executes line 2, line 2 should be visibly highlighted.

Pseudocode should not be merely decorative.

It must correspond meaningfully to the execution engine.

---

# 26. Execution Model

Algorithms execute as discrete deterministic steps.

The core controller should conceptually provide:

```ts
stepForward()
stepBackward()
run()
pause()
reset()
```

The same execution controller must be used by:

* mouse controls,
* keyboard controls,
* presenter pointer controls.

Do not implement separate execution logic for different input methods.

---

# 27. Step Forward

Step Forward advances exactly one execution step.

It should update:

* visualization,
* algorithm state,
* pseudocode active line,
* state panel,
* explanation,
* decision trace.

A step should represent a meaningful pedagogical unit.

Avoid making every trivial internal operation a separate step unless it improves understanding.

---

# 28. Step Backward

Backward stepping must be deterministic.

Do not attempt to reverse arbitrary mutations.

Use execution history/snapshots or an equivalent deterministic state model.

Conceptually:

```text
state[0]
state[1]
state[2]
state[3]
...
```

Step Backward changes the current visible state to an earlier state.

The UI must correctly restore:

* graph state,
* data structures,
* pseudocode line,
* explanation,
* trace,
* metrics.

---

# 29. Run / Pause

Run automatically advances through execution steps.

Pause stops automatic execution.

The implementation should use the same step mechanism as manual Step Forward.

Do not create a separate animation-only execution path.

---

# 30. Speed Control

Provide a reasonable execution speed control.

The speed should affect automatic playback, not the semantics of the algorithm.

Step Forward should always represent exactly one logical execution step regardless of speed.

---

# 31. Execution Controls

Controls should include:

* Step Backward
* Step Forward
* Run / Pause
* Reset
* Speed

Controls should be visually clear.

The most important controls should be easy to locate.

The UI should work well with a presenter pointer.

---

# 32. Presenter Pointer Support

The lecturer uses a presentation remote whose physical buttons generate keyboard events.

The application must respond to browser keyboard events.

Do not attempt to communicate directly with presenter hardware.

Primary mappings:

```text
PageDown    → Step Forward
PageUp      → Step Backward
```

Keyboard fallback:

```text
ArrowRight  → Step Forward
ArrowLeft   → Step Backward
```

Other shortcuts:

```text
Space       → Run / Pause
R           → Reset
?           → Show keyboard shortcuts
Esc         → Close temporary UI / exit fullscreen
```

These mappings should remain functional in fullscreen mode.

---

# 33. Keyboard Event Rules

Global shortcuts must not fire while the user is typing.

Ignore global shortcuts when the event originates from:

* input,
* textarea,
* select,
* contenteditable.

Keyboard event handling should be centralized.

Do not attach independent global keyboard listeners to many unrelated components.

Prefer a single shortcut infrastructure that dispatches actions to the execution controller.

---

# 34. Keyboard Shortcut Help

Provide a keyboard-shortcut help UI.

It should clearly display:

```text
Page Down / →    Step Forward
Page Up / ←      Step Backward
Space             Run / Pause
R                 Reset
?                 Show Shortcuts
Esc               Close / Exit Fullscreen
```

Use a shadcn-svelte Dialog or another appropriate accessible UI primitive.

---

# 35. Theme

Support:

* Light mode
* Dark mode

Provide a visible theme toggle.

The interface must be professionally designed in both themes.

Do not rely solely on color to communicate algorithmic state.

Use combinations of:

* color,
* labels,
* borders,
* shapes,
* typography,
* position,
* icons where useful.

Theme preference should persist where practical.

---

# 36. Fullscreen

Provide a visible fullscreen control.

Use the browser Fullscreen API.

Fullscreen is intended for classroom presentation.

When fullscreen is active:

* visualization should have maximum useful space,
* controls remain accessible,
* keyboard shortcuts continue to work,
* PageUp/PageDown remain functional,
* Esc should exit fullscreen where browser behavior permits.

Do not create a fake CSS-only fullscreen mode when the browser Fullscreen API is appropriate.

---

# 37. Visual Design

The design should be:

* modern,
* clean,
* professional,
* academic,
* calm,
* highly readable.

Avoid:

* childish design,
* gaming aesthetics,
* excessive gradients,
* excessive glassmorphism,
* decorative clutter,
* oversized decorative illustrations,
* unnecessary animations.

Prioritize:

* typography,
* spacing,
* hierarchy,
* clear borders,
* meaningful color,
* visualization,
* readable controls.

---

# 38. Color Usage

Color should communicate semantic state.

For example:

* current node,
* visited node,
* frontier node,
* final path,
* active pseudocode line,
* selected queue item.

Do not use too many colors simultaneously.

Maintain sufficient contrast in both light and dark themes.

The same semantic state should use consistent visual treatment throughout the application.

---

# 39. Animation

Animations should communicate state changes.

Good uses:

* node entering frontier,
* node becoming current,
* edge becoming part of final path,
* queue/stack updates,
* priority queue reordering.

Avoid:

* unnecessary bouncing,
* excessive motion,
* decorative transitions,
* animations that obscure the current state.

Correctness and clarity are more important than animation quality.

---

# 40. Algorithm Architecture

Algorithm logic must be independent from UI components.

Prefer an architecture similar to:

```text
src/
├── lib/
│   ├── algorithms/
│   │   ├── search/
│   │   │   ├── bfs.ts
│   │   │   ├── dfs.ts
│   │   │   ├── ucs.ts
│   │   │   ├── greedy.ts
│   │   │   └── astar.ts
│   │   └── ...
│   │
│   ├── execution/
│   │   ├── controller.ts
│   │   ├── history.ts
│   │   └── types.ts
│   │
│   ├── graph/
│   │   ├── types.ts
│   │   └── defaultGraph.ts
│   │
│   ├── shortcuts/
│   │   └── shortcuts.ts
│   │
│   └── ...
│
├── components/
│   ├── layout/
│   ├── visualization/
│   ├── execution/
│   ├── pseudocode/
│   └── ui/
│
└── routes/
    └── ...
```

The exact directory structure may evolve.

The important principle is separation of concerns.

---

# 41. Algorithm Step Representation

Algorithms should preferably generate explicit execution information rather than directly manipulating Svelte UI state.

A step may conceptually contain:

```ts
type ExecutionStep = {
  state: AlgorithmState
  activePseudocodeLine?: number
  explanation: string
  traceEntry?: string
}
```

The exact type may differ.

The execution engine should be able to reconstruct the complete visible state from the current step.

---

# 42. Determinism

Algorithm demonstrations must be deterministic unless randomness is itself part of the lesson.

Given the same:

* graph,
* start node,
* goal node,
* edge costs,
* heuristic values,
* algorithm configuration,

the execution should produce the same sequence of states.

This is particularly important for:

* Step Backward,
* classroom explanation,
* testing,
* comparing algorithms.

---

# 43. Testing

Algorithm correctness is more important than UI animation.

Use Vitest for algorithm tests.

Test cases should cover:

* correct path,
* correct path cost,
* node expansion order where relevant,
* frontier behavior,
* termination,
* edge cases.

Search algorithms should be tested independently from Svelte components.

UI tests should not be the only form of algorithm validation.

---

# 44. Future Search Comparison Mode

A future feature may allow side-by-side comparison:

```text
BFS       DFS       UCS       Greedy       A*
```

Possible metrics:

* final path,
* path cost,
* expanded nodes,
* number of steps,
* execution behavior.

Do not implement this prematurely unless it naturally fits the architecture.

The underlying search engine should make future comparison possible.

---

# 45. Genetic Algorithm

The Genetic Algorithm visualization should show the evolutionary process.

Important state:

* generation,
* population,
* chromosome,
* fitness,
* selected parents,
* crossover,
* mutation,
* new population.

The visualization should make the sequence understandable:

```text
Population
    ↓
Fitness Evaluation
    ↓
Selection
    ↓
Crossover
    ↓
Mutation
    ↓
New Population
```

Each stage should be visible through execution steps.

---

# 46. Propositional Logic

The Propositional Logic module should make reasoning visible.

Potential elements:

* propositions,
* logical operators,
* expressions,
* truth assignments,
* truth tables,
* models,
* inference steps.

The emphasis should be on how conclusions are derived.

---

# 47. First-Order Logic

The First-Order Logic module should visualize concepts such as:

* predicates,
* variables,
* constants,
* functions,
* quantifiers,
* substitutions,
* interpretations,
* inference.

Do not reduce the module to a static formula renderer.

The reasoning process should remain visible.

---

# 48. Prolog

The Prolog visualization should emphasize:

* facts,
* rules,
* query,
* unification,
* variable bindings,
* search,
* backtracking,
* proof state.

A query should visibly progress through the search/proof process.

Backtracking should be particularly clear because it is an important teaching concept.

---

# 49. K-Nearest Neighbor

The KNN visualization should show:

* dataset points,
* classes,
* query point,
* value of `k`,
* distances,
* nearest neighbors,
* voting,
* predicted class.

The user should be able to see why a particular class was selected.

---

# 50. Naïve Bayes

The Naïve Bayes visualization should expose:

* candidate classes,
* prior probability,
* features/evidence,
* likelihood,
* posterior,
* final prediction.

The reasoning should be represented step by step.

Example:

```text
Class A
Prior
Likelihood
Posterior

Class B
Prior
Likelihood
Posterior
```

Then show why the final class wins.

---

# 51. Interaction Principles

Interactions should be predictable.

Prefer:

* visible feedback,
* clear affordances,
* consistent controls,
* keyboard support,
* accessible labels,
* tooltips for unfamiliar icons.

Do not hide essential functionality behind obscure interactions.

---

# 52. Accessibility

The application should follow reasonable accessibility practices.

Include:

* keyboard accessibility,
* visible focus states,
* sufficient contrast,
* semantic buttons,
* accessible labels,
* appropriate ARIA attributes where necessary.

Do not use clickable `div`s when a button is appropriate.

Icons alone should have accessible labels/tooltips when their meaning is not obvious.

---

# 53. Responsive Design

Desktop and classroom presentation are primary targets.

The UI should still behave reasonably at smaller widths.

Do not optimize mobile at the expense of the main classroom experience.

If a layout needs to collapse:

* prioritize visualization,
* keep essential controls accessible,
* avoid excessive horizontal scrolling.

---

# 54. State Management

Do not introduce a global state-management library unless the application genuinely requires one.

Svelte's built-in state mechanisms should be sufficient initially.

Keep state close to the domain that owns it.

Execution state should be handled by the execution architecture rather than scattered throughout UI components.

---

# 55. Dependencies

Keep dependencies intentionally limited.

Approved primary stack:

```text
Svelte
TypeScript
Vite
Tailwind CSS
shadcn-svelte
Lucide
@xyflow/svelte
Dagre (only when needed)
Vitest
Playwright (if needed)
```

Before adding another dependency, ask:

1. Is this problem difficult to solve cleanly with the current stack?
2. Does the dependency significantly improve the application?
3. Is the dependency maintained and appropriate?
4. Can the project remain simpler without it?

Avoid dependency accumulation.

---

# 56. Avoid Premature Abstraction

Do not build an elaborate framework inside the application.

Avoid:

* unnecessary generic abstractions,
* over-engineered plugin systems,
* complex state machines when not needed,
* excessive configuration,
* unnecessary design-system layers.

Build the smallest architecture that supports the product requirements cleanly.

---

# 57. Code Quality

Prefer code that is:

* readable,
* explicit,
* typed,
* modular,
* testable.

Avoid:

* giant components,
* duplicated execution logic,
* hidden mutable state,
* unclear side effects,
* arbitrary magic numbers,
* unnecessary abstractions.

Comments should explain why something is done when the reason is not obvious.

Do not comment obvious code excessively.

---

# 58. UI Component Principles

Use shadcn-svelte for common interface primitives.

Use custom components for:

* graph nodes,
* graph edges,
* queue visualization,
* stack visualization,
* priority queue visualization,
* pseudocode,
* decision trace,
* algorithm state visualization.

Do not force specialized educational components into generic shadcn-svelte components.

---

# 59. Graph Visualization Principles

The graph is not just a data structure representation.

It is a teaching surface.

Students should immediately understand:

* where the start is,
* where the goal is,
* what is currently being explored,
* what has already been explored,
* what is waiting in the frontier,
* what path was found.

Node and edge states should transition clearly.

The graph should remain visually stable during normal execution.

---

# 60. Priority Queue Visualization

For UCS, Greedy, and A* provide a dedicated priority queue representation.

The queue should expose the value used for ordering.

Examples:

```text
UCS

B   g=3
A   g=5
D   g=8
```

```text
Greedy

D   h=2
B   h=4
A   h=7
```

```text
A*

C   g=4  h=3  f=7
B   g=2  h=6  f=8
D   g=5  h=5  f=10
```

This makes the difference between algorithms visible.

---

# 61. Default Teaching Experience

When the application first opens, the user should encounter a polished, working foundation.

The first implementation phase should prioritize:

1. Application shell
2. Navigation
3. Theme
4. Fullscreen
5. Keyboard shortcuts
6. Execution controls
7. Pseudocode component
8. Graph visualization infrastructure
9. State panel
10. A working search visualization foundation

Do not attempt to implement every algorithm immediately.

Build the architecture so additional algorithms can be added cleanly.

---

# 62. Development Priority

Use this order unless there is a strong reason to change it:

### Phase 1 — Foundation

* project setup
* application shell
* Tailwind
* shadcn-svelte
* Lucide
* theme
* fullscreen
* layout
* navigation

### Phase 2 — Execution Infrastructure

* execution state
* step forward
* step backward
* run
* pause
* reset
* history/snapshots
* keyboard shortcuts

### Phase 3 — Visualization Infrastructure

* Svelte Flow
* graph nodes
* graph edges
* graph state
* state panel
* pseudocode
* decision explanation
* decision trace

### Phase 4 — Search Algorithms

* BFS
* DFS
* UCS
* Greedy Best-First Search
* A*

### Phase 5 — Other AI Topics

* Genetic Algorithm
* Propositional Logic
* First-Order Logic
* Prolog
* KNN
* Naïve Bayes

---

# 63. Definition of Done

A feature is not considered complete merely because it renders.

For an algorithm visualization, it should:

* be algorithmically correct,
* execute step by step,
* support backward stepping,
* support reset,
* support run/pause,
* update the visualization correctly,
* update the state panel,
* update pseudocode,
* explain important decisions,
* maintain a decision trace where appropriate,
* work with keyboard controls,
* work with PageUp/PageDown,
* remain readable in fullscreen,
* work in light and dark themes.

---

# 64. Error Handling

Errors should be understandable.

Avoid exposing raw technical errors to students where a clear explanation is possible.

Developer errors should still be easy to diagnose.

Do not silently swallow errors.

---

# 65. GitHub Pages

The application must remain deployable as a static frontend to GitHub Pages.

Do not introduce assumptions that require:

* a backend,
* server-side rendering,
* persistent server state,
* server APIs.

Any required configuration for Vite/GitHub Pages should be kept explicit and maintainable.

---

# 66. Performance

The application should feel responsive during classroom demonstrations.

Avoid unnecessary:

* re-renders,
* expensive calculations during every animation frame,
* DOM-heavy visualization,
* excessive reactive dependencies.

Algorithm calculations should remain small enough for teaching examples.

Do not optimize prematurely.

Measure before introducing complexity.

---

# 67. Classroom UX

A lecturer should be able to:

1. Open Ithaca.
2. Select an algorithm.
3. Explain the initial state.
4. Press PageDown to advance.
5. Explain the highlighted pseudocode line.
6. Show the graph/state change.
7. Explain why the algorithm made its decision.
8. Continue stepping.
9. Press PageUp if they want to revisit the previous state.
10. Run the algorithm automatically when appropriate.
11. Reset and demonstrate another algorithm.

The interaction should require minimal mouse manipulation.

---

# 68. Presenter-First Principle

The presenter pointer is a first-class input device.

PageUp/PageDown support must not be treated as an afterthought.

The core execution controller must be independent from the input method so that:

```text
Mouse
Keyboard
Presenter Pointer
```

all trigger the same actions.

---

# 69. Do Not Over-Engineer

This is an educational application, not a large enterprise platform.

Prefer:

```text
simple + explicit + correct
```

over:

```text
abstract + configurable + complex
```

When two implementations are equally valid, choose the simpler one.

---

# 70. AI Coding / Vibe Coding Rules

When implementing features:

1. Read `CLAUDE.md` first.
2. Inspect the existing repository before modifying files.
3. Understand existing architecture before adding abstractions.
4. Reuse existing components and utilities.
5. Do not introduce dependencies without justification.
6. Keep algorithm logic separate from UI.
7. Test algorithm correctness independently.
8. Verify the application builds after significant changes.
9. Do not rewrite working code unnecessarily.
10. Prefer incremental implementation.

When a requirement is ambiguous, choose the simplest implementation consistent with the product philosophy.

---

# 71. Important Product Constraint

Do not turn Ithaca into a generic component showcase.

Every major UI element should support teaching.

For example:

* graph colors should explain state,
* queue contents should explain BFS,
* stack contents should explain DFS,
* priority values should explain UCS/Greedy/A*,
* pseudocode highlighting should explain execution,
* decision explanations should explain choices,
* trace history should explain reasoning.

The question for every feature should be:

> **“Does this help the student understand what the algorithm is doing?”**

If not, it probably does not belong in the MVP.

---

# 72. Core Product Principle

Always preserve the central purpose of Ithaca:

> **Show the reasoning process, not only the final answer.**

And the intended student reaction:

> **“I can see why the algorithm did that.”**

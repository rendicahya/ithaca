/**
 * The subset of ExecutionController that playback UI (step/run/pause/reset
 * controls) needs — independent of the step payload type, so one control
 * bar component works for every topic without being generic itself.
 */
export interface PlaybackController {
  isAtStart: boolean
  isAtEnd: boolean
  isRunning: boolean
  speedMs: number
  progress: { current: number; total: number }
  stepForward: () => void
  stepBackward: () => void
  toggleRun: () => void
  reset: () => void
}

/**
 * Drives step-by-step playback over a precomputed, deterministic array of
 * execution steps. Precomputing every step (rather than mutating state
 * incrementally) is what makes backward stepping trivial and exact: going
 * back is just moving an index, never "undoing" a mutation.
 *
 * The same instance backs mouse controls, keyboard shortcuts, and the
 * presenter pointer — none of them contain their own execution logic. It is
 * generic over the step type so every topic (search algorithms, Prolog, ...)
 * shares one execution engine instead of reimplementing stepping/run/pause.
 */
export class ExecutionController<TStep> implements PlaybackController {
  steps = $state<TStep[]>([])
  currentIndex = $state(0)
  isRunning = $state(false)
  speedMs = $state(1000)

  private timer: ReturnType<typeof setTimeout> | undefined

  constructor(steps: TStep[] = []) {
    this.load(steps)
  }

  get current(): TStep | undefined {
    return this.steps[this.currentIndex]
  }

  get isAtStart(): boolean {
    return this.currentIndex <= 0
  }

  get isAtEnd(): boolean {
    return this.currentIndex >= this.steps.length - 1
  }

  get progress(): { current: number; total: number } {
    return { current: this.currentIndex + 1, total: this.steps.length }
  }

  load(steps: TStep[]): void {
    this.pause()
    this.steps = steps
    this.currentIndex = 0
  }

  stepForward = (): void => {
    if (this.isAtEnd) {
      this.pause()
      return
    }
    this.currentIndex += 1
    if (this.isAtEnd) this.pause()
  }

  stepBackward = (): void => {
    this.pause()
    if (this.isAtStart) return
    this.currentIndex -= 1
  }

  reset = (): void => {
    this.pause()
    this.currentIndex = 0
  }

  run = (): void => {
    if (this.isAtEnd || this.isRunning) return
    this.isRunning = true
    this.scheduleTick()
  }

  pause = (): void => {
    this.isRunning = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
  }

  toggleRun = (): void => {
    if (this.isRunning) this.pause()
    else this.run()
  }

  private scheduleTick(): void {
    this.timer = setTimeout(() => {
      this.stepForward()
      if (this.isRunning && !this.isAtEnd) this.scheduleTick()
      else this.pause()
    }, this.speedMs)
  }
}

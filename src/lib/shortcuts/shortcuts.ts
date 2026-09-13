/**
 * Centralized keyboard shortcut infrastructure. A single global listener
 * dispatches to the execution controller — mouse, keyboard, and presenter
 * pointer (which only emits standard key events) all go through the same
 * actions, so there is exactly one execution path to keep correct.
 */
export interface ShortcutActions {
  stepForward: () => void
  stepBackward: () => void
  toggleRun: () => void
  reset: () => void
  toggleHelp: () => void
  closeOrExitFullscreen: () => void
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

export function handleShortcutKey(event: KeyboardEvent, actions: ShortcutActions): void {
  if (isTypingTarget(event.target)) return

  switch (event.key) {
    case 'PageDown':
    case 'ArrowRight':
      event.preventDefault()
      actions.stepForward()
      break
    case 'PageUp':
    case 'ArrowLeft':
      event.preventDefault()
      actions.stepBackward()
      break
    case ' ':
      event.preventDefault()
      actions.toggleRun()
      break
    case 'r':
    case 'R':
      actions.reset()
      break
    case '?':
      actions.toggleHelp()
      break
    case 'Escape':
      actions.closeOrExitFullscreen()
      break
  }
}

/** Attaches the single global shortcut listener; returns a cleanup function. */
export function registerGlobalShortcuts(actions: ShortcutActions): () => void {
  const listener = (event: KeyboardEvent) => handleShortcutKey(event, actions)
  window.addEventListener('keydown', listener)
  return () => window.removeEventListener('keydown', listener)
}

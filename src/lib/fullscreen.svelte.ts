/** Thin wrapper over the browser Fullscreen API — no CSS-only fake fullscreen. */
class FullscreenStore {
  isFullscreen = $state(false)

  constructor() {
    if (typeof document === 'undefined') return
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = document.fullscreenElement !== null
    })
  }

  toggle = async (): Promise<void> => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await document.documentElement.requestFullscreen()
    }
  }

  exit = async (): Promise<void> => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  }
}

export const fullscreenStore = new FullscreenStore()

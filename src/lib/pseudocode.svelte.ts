const STORAGE_KEY = 'ithaca-pseudocode-visible'

/** Remembers whether the lecturer last had the pseudocode panel shown or hidden. */
class PseudocodeVisibilityStore {
  visible = $state(true)

  constructor() {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true' || stored === 'false') this.visible = stored === 'true'
  }

  set = (visible: boolean): void => {
    this.visible = visible
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, String(visible))
  }
}

export const pseudocodeVisibilityStore = new PseudocodeVisibilityStore()

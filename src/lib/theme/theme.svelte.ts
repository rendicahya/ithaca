export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'ithaca-theme'

class ThemeStore {
  theme = $state<Theme>('light')

  constructor() {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    this.theme = stored ?? (prefersDark ? 'dark' : 'light')
    this.apply()
  }

  toggle = (): void => {
    this.theme = this.theme === 'light' ? 'dark' : 'light'
    localStorage.setItem(STORAGE_KEY, this.theme)
    this.apply()
  }

  private apply(): void {
    document.documentElement.classList.toggle('dark', this.theme === 'dark')
  }
}

export const themeStore = new ThemeStore()

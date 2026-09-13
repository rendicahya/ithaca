import { dictionary } from './dictionary'
import type { Locale, Translatable } from './translate'
import { t as translate } from './translate'

const STORAGE_KEY = 'ithaca-locale'

class LocaleStore {
  locale = $state<Locale>('en')

  constructor() {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored === 'en' || stored === 'id') this.locale = stored
  }

  set = (locale: Locale): void => {
    this.locale = locale
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, locale)
  }

  toggle = (): void => {
    this.set(this.locale === 'en' ? 'id' : 'en')
  }

  t = (message: Translatable): string => translate(this.locale, dictionary, message)
}

export const localeStore = new LocaleStore()

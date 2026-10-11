export type Locale = 'en' | 'id'

/**
 * A translatable message: a dictionary key plus the values to interpolate
 * into it. Algorithms produce these instead of pre-formatted strings, so
 * switching language never requires re-running the algorithm — locale is
 * purely a presentation concern.
 */
export interface Message {
  key: string
  /** A nested Message param is translated too, e.g. a factor name inside an explanation. */
  params?: Record<string, string | number | Message>
}

export function msg(key: string, params?: Record<string, string | number | Message>): Message {
  return { key, params }
}

export type Translatable = Message | string

export function t(locale: Locale, dictionary: Record<Locale, Record<string, string>>, message: Translatable): string {
  const key = typeof message === 'string' ? message : message.key
  const params = typeof message === 'string' ? undefined : message.params
  const template = dictionary[locale]?.[key] ?? dictionary.en[key] ?? key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    if (!(name in params)) return `{${name}}`
    const value = params[name]
    return typeof value === 'object' ? t(locale, dictionary, value) : String(value)
  })
}

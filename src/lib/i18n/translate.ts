export type Locale = 'en' | 'id'

/**
 * A translatable message: a dictionary key plus the values to interpolate
 * into it. Algorithms produce these instead of pre-formatted strings, so
 * switching language never requires re-running the algorithm — locale is
 * purely a presentation concern.
 */
export interface Message {
  key: string
  params?: Record<string, string | number>
}

export function msg(key: string, params?: Record<string, string | number>): Message {
  return { key, params }
}

export type Translatable = Message | string

export function t(locale: Locale, dictionary: Record<Locale, Record<string, string>>, message: Translatable): string {
  const key = typeof message === 'string' ? message : message.key
  const params = typeof message === 'string' ? undefined : message.params
  const template = dictionary[locale]?.[key] ?? dictionary.en[key] ?? key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  )
}

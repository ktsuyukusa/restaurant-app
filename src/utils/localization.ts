/**
 * Get localized value from a multilingual object
 * @param obj - Object containing language keys and values
 * @param lang - Current language code
 * @returns Localized string value
 */
export function getLocalizedValue(obj: Record<string, string>, lang: string): string {
  return (
    obj?.[lang] ||
    obj?.['en'] ||
    obj?.['ja'] ||
    Object.values(obj || {})[0] || ''
  )
} 
/**
 * Detects the best matching locale from Accept-Language header.
 *
 * Parses the Accept-Language header (e.g., "ja,en-US;q=0.9,en;q=0.8")
 * and returns the highest priority locale that matches the supported locales.
 *
 * @param acceptLanguage - The Accept-Language header value from the request
 * @param supportedLocales - Array of locale codes supported by the application
 * @returns The best matching locale, or null if no match is found
 *
 * @example
 * ```typescript
 * // Accept-Language: "fr,ja;q=0.8,en;q=0.6"
 * // supportedLocales: ['ja', 'en']
 * detectLocale(acceptLanguage, supportedLocales) // Returns: 'ja'
 *
 * // Accept-Language: "fr,de;q=0.9"
 * // supportedLocales: ['ja', 'en']
 * detectLocale(acceptLanguage, supportedLocales) // Returns: null
 * ```
 */
export function detectLocale(
  acceptLanguage: string | null,
  supportedLocales: readonly string[]
): string | null {
  if (!acceptLanguage) return null

  // Parse and sort by quality (priority)
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, q] = lang.trim().split(';q=')
      // Normalize: "en-US" → "en", "ja-JP" → "ja"
      const normalizedLocale = locale.split('-')[0].toLowerCase()
      const quality = q ? parseFloat(q) : 1.0
      return { locale: normalizedLocale, quality }
    })
    .sort((a, b) => b.quality - a.quality) // Higher quality first

  // Find first matching locale
  for (const { locale } of languages) {
    if (supportedLocales.includes(locale)) {
      return locale
    }
  }

  return null
}

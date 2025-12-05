/**
 * Generate a localized path with locale prefix
 *
 * @param path - The path to localize (e.g., '/about')
 * @param locale - The target locale (e.g., 'ja')
 * @param defaultLocale - The default locale (e.g., 'en')
 * @returns The localized path (e.g., '/ja/about' or '/about' for default locale)
 *
 * @example
 * ```typescript
 * import { getLocalizedPath } from '@i18n-tiny/next/router'
 *
 * const path = getLocalizedPath('/about', 'ja', 'en')  // '/ja/about'
 * const defaultPath = getLocalizedPath('/about', 'en', 'en')  // '/about'
 * ```
 */
export function getLocalizedPath(
  path: string,
  locale: string,
  defaultLocale: string
): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  // Avoid double prefixing
  if (cleanPath.startsWith(`/${locale}/`) || cleanPath === `/${locale}`) {
    return cleanPath
  }

  // For default locale, no prefix needed
  if (locale === defaultLocale) {
    return cleanPath
  }

  // Add locale prefix for non-default locales
  return cleanPath === '/' ? `/${locale}` : `/${locale}${cleanPath}`
}

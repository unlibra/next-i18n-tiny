/**
 * @i18n-tiny/astro/router
 *
 * Routing utilities for Astro i18n
 */

/**
 * Generate a localized path with locale prefix
 *
 * @param path - The path to localize (e.g., '/about')
 * @param locale - The target locale (e.g., 'ja')
 * @param defaultLocale - The default locale (e.g., 'en')
 * @param prefixDefault - Whether to add prefix for default locale (default: false)
 * @returns The localized path (e.g., '/ja/about' or '/about' for default locale)
 *
 * @example
 * ```typescript
 * import { getLocalizedPath } from '@i18n-tiny/astro/router'
 *
 * getLocalizedPath('/about', 'ja', 'en')  // '/ja/about'
 * getLocalizedPath('/about', 'en', 'en')  // '/about'
 * getLocalizedPath('/about', 'en', 'en', true)  // '/en/about' (for static builds)
 * ```
 */
export function getLocalizedPath(
  path: string,
  locale: string,
  defaultLocale: string,
  prefixDefault: boolean = false
): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  // Avoid double prefixing
  if (cleanPath.startsWith(`/${locale}/`) || cleanPath === `/${locale}`) {
    return cleanPath
  }

  // For default locale, no prefix needed (unless prefixDefault is true)
  if (locale === defaultLocale && !prefixDefault) {
    return cleanPath
  }

  // Add locale prefix
  return cleanPath === '/' ? `/${locale}` : `/${locale}${cleanPath}`
}

/**
 * Remove locale prefix from pathname
 *
 * @param pathname - The pathname to process (e.g., "/ja/about")
 * @param locales - Array of supported locales
 * @returns The pathname without locale prefix
 *
 * @example
 * ```typescript
 * import { removeLocalePrefix } from '@i18n-tiny/astro/router'
 *
 * removeLocalePrefix('/ja/about', ['en', 'ja']) // '/about'
 * removeLocalePrefix('/ja', ['en', 'ja'])       // '/'
 * removeLocalePrefix('/about', ['en', 'ja'])    // '/about'
 * ```
 */
export function removeLocalePrefix(
  pathname: string,
  locales: readonly string[]
): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1)
    }
    if (pathname === `/${locale}`) {
      return '/'
    }
  }
  return pathname
}

'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'

// Import hooks from react/internal
import {
  useLocale,
  useDefaultLocale,
  useLocales
} from '@i18n-tiny/react/internal'

/**
 * Hook that returns a function to generate localized paths
 *
 * @example
 * ```tsx
 * import { useLocalizedPath } from '@i18n-tiny/next/router'
 *
 * function MyComponent() {
 *   const getLocalizedPath = useLocalizedPath()
 *   const aboutPath = getLocalizedPath('/about')  // '/ja/about' or '/about'
 *
 *   return <a href={aboutPath}>About</a>
 * }
 * ```
 */
export function useLocalizedPath() {
  const locale = useLocale()
  const defaultLocale = useDefaultLocale()
  const locales = useLocales()
  const pathname = usePathname()

  // Check if current pathname has explicit locale prefix
  const hasExplicitLocale = useMemo(
    () =>
      pathname
        ? locales.some(
            (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
          )
        : false,
    [pathname, locales]
  )

  return useCallback(
    (path: string) => {
      const cleanPath = path.startsWith('/') ? path : `/${path}`

      // Avoid double prefixing
      if (cleanPath.startsWith(`/${locale}/`) || cleanPath === `/${locale}`) {
        return cleanPath
      }

      // For default locale
      if (locale === defaultLocale) {
        // Respect explicit locale prefix if present in the target path
        if (cleanPath.startsWith(`/${defaultLocale}/`) || cleanPath === `/${defaultLocale}`) {
          return cleanPath
        }
        // If current URL has explicit locale, preserve it in new links
        if (!hasExplicitLocale) {
          return cleanPath
        }
      }

      // Add locale prefix for non-default locales or explicit default locale
      return cleanPath === '/' ? `/${locale}` : `/${locale}${cleanPath}`
    },
    [locale, defaultLocale, hasExplicitLocale]
  )
}

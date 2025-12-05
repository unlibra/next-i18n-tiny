'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'

import { useLocale } from '@i18n-tiny/react/internal'

/**
 * Hook that returns a function to generate localized paths
 *
 * Automatically detects whether locale prefix is needed based on current URL.
 * - If current URL has locale prefix (e.g., /ja/about) → generated paths will have prefix
 * - If current URL has no prefix (e.g., /about) → generated paths will have no prefix
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
  const pathname = usePathname()

  // Check if current pathname has explicit locale prefix
  const hasExplicitLocale = useMemo(
    () =>
      pathname
        ? pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
        : false,
    [pathname, locale]
  )

  return useCallback(
    (path: string) => {
      const cleanPath = path.startsWith('/') ? path : `/${path}`

      // Mirror current URL pattern: if URL has locale prefix, add prefix
      if (hasExplicitLocale) {
        return cleanPath === '/' ? `/${locale}` : `/${locale}${cleanPath}`
      }

      // No prefix in current URL → no prefix in generated paths
      return cleanPath
    },
    [locale, hasExplicitLocale]
  )
}

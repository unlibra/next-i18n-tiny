'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'
import { useCallback, useMemo } from 'react'

// Import hooks for internal use
import {
  useLocale,
  useDefaultLocale,
  useLocales
} from '@i18n-tiny/react/internal'

// Next.js specific hooks
export function useLocalizedPath () {
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

// Next.js specific Link component
export function I18nLink ({ href, ...props }: ComponentProps<typeof NextLink>) {
  const getPath = useLocalizedPath()

  // Handle both string and UrlObject
  const localizedHref = typeof href === 'string'
    ? getPath(href)
    : { ...href, pathname: getPath(href.pathname ?? '') }

  return <NextLink href={localizedHref} {...props} />
}

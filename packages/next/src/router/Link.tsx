'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'

import { useLocale } from '@i18n-tiny/react/internal'
import {
  getLocalizedPath as coreGetLocalizedPath,
  hasLocalePrefix
} from '@i18n-tiny/core/router'

export interface LinkProps extends Omit<ComponentProps<typeof NextLink>, 'locale'> {
  /**
   * Override the locale for this link
   * - undefined: auto-localize based on current locale (default)
   * - string (e.g., 'en', 'ja'): generate path for specified locale with prefix
   * - '' (empty string): use href as-is without any localization (raw path)
   */
  locale?: string
}

/**
 * Next.js Link component with automatic locale prefix
 *
 * Automatically detects whether locale prefix is needed based on current URL:
 * - If current URL has locale prefix → generated links have prefix
 * - If current URL has no prefix → generated links have no prefix
 *
 * @example
 * ```tsx
 * import { Link } from '@i18n-tiny/next/router'
 *
 * // Auto-localized link (uses current locale and URL pattern)
 * <Link href="/about">About</Link>
 *
 * // Language switch with explicit locale prefix
 * <Link href="/" locale="ja">日本語</Link>
 *
 * // Raw path (no localization)
 * <Link href="/" locale="">English</Link>
 * ```
 */
export function Link({ href, locale, ...props }: LinkProps) {
  const currentLocale = useLocale()
  const pathname = usePathname()

  // Check if current URL has locale prefix
  const urlHasPrefix = pathname ? hasLocalePrefix(pathname, currentLocale) : false

  const getLocalizedHref = (path: string): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`

    // locale="": use path as-is (no localization)
    if (locale === '') {
      return cleanPath
    }

    // locale="ja": explicit locale prefix
    if (locale !== undefined) {
      return cleanPath === '/' ? `/${locale}` : `/${locale}${cleanPath}`
    }

    // locale={undefined}: auto-detect from current URL
    if (urlHasPrefix) {
      return cleanPath === '/' ? `/${currentLocale}` : `/${currentLocale}${cleanPath}`
    }

    return cleanPath
  }

  // Handle both string and UrlObject
  const localizedHref = typeof href === 'string'
    ? getLocalizedHref(href)
    : { ...href, pathname: getLocalizedHref(href.pathname ?? '') }

  return <NextLink href={localizedHref} {...props} />
}

'use client'

import NextLink from 'next/link'
import type { ComponentProps } from 'react'
import { useLocalizedPath } from './useLocalizedPath'

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
 * @example
 * ```tsx
 * import { Link } from '@i18n-tiny/next/router'
 *
 * // Auto-localized link (uses current locale)
 * <Link href="/about">About</Link>
 *
 * // Language switch with explicit locale prefix
 * <Link href="/" locale="ja">日本語</Link>
 *
 * // Raw path (no localization) - useful for default locale
 * <Link href="/" locale="">English</Link>
 * ```
 */
export function Link({ href, locale, ...props }: LinkProps) {
  const getPath = useLocalizedPath()

  // If locale is explicitly specified, generate path for that locale
  const getLocalizedHref = (path: string): string => {
    // locale="": use path as-is (no localization)
    if (locale === '') {
      return path.startsWith('/') ? path : `/${path}`
    }
    // locale="en" or "ja": explicit locale prefix
    if (locale !== undefined) {
      const cleanPath = path.startsWith('/') ? path : `/${path}`
      return cleanPath === '/' ? `/${locale}` : `/${locale}${cleanPath}`
    }
    // locale={undefined}: auto-localize based on current locale
    return getPath(path)
  }

  // Handle both string and UrlObject
  const localizedHref = typeof href === 'string'
    ? getLocalizedHref(href)
    : { ...href, pathname: getLocalizedHref(href.pathname ?? '') }

  return <NextLink href={localizedHref} {...props} />
}

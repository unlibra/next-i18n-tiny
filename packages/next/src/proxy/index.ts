/**
 * @i18n-tiny/next/proxy
 *
 * Proxy for Next.js i18n routing
 *
 * @example
 * // proxy.ts (Next.js 16+)
 * import { create } from '@i18n-tiny/next/proxy'
 * import { i18n } from './i18n'
 *
 * export const proxy = create(i18n)
 * export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] }
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { detectLocale } from '@i18n-tiny/core'

export interface ProxyConfig {
  /** Array of supported locales (e.g., ['en', 'ja']) */
  locales: readonly string[]
  /** Default locale to use when none is detected */
  defaultLocale: string
  /**
   * Always add locale prefix to all URLs (including default locale)
   * - false: Default locale uses clean URLs without prefix (e.g., /about)
   * - true: All locales use prefix (e.g., /en/about, /ja/about)
   * @default false
   */
  alwaysPrefixLocale?: boolean
  /**
   * Fallback locale when detection fails or unsupported locale is requested
   * @default defaultLocale
   */
  fallbackLocale?: string
  /**
   * Whether to detect user's preferred language from Accept-Language header
   * @default true
   */
  detectLanguage?: boolean
}

/**
 * @deprecated Use ProxyConfig instead
 */
export type MiddlewareConfig = ProxyConfig

/**
 * Creates a Next.js proxy (middleware) handler for i18n routing
 *
 * Behavior:
 * - If URL already has a locale prefix → pass through
 * - Otherwise → detect locale from Accept-Language header
 *   - If detected locale is in locales list → redirect to that locale
 *   - Otherwise → use fallbackLocale (defaults to defaultLocale)
 */
export function create(config: ProxyConfig) {
  const {
    locales,
    defaultLocale,
    alwaysPrefixLocale = false,
    fallbackLocale = defaultLocale,
    detectLanguage = true
  } = config

  return function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if pathname already has a locale prefix
    const hasLocale = locales.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (hasLocale) {
      return NextResponse.next()
    }

    // Detect locale from Accept-Language header or use fallback
    let detectedLocale = fallbackLocale
    if (detectLanguage) {
      const acceptLanguage = request.headers.get('accept-language')
      detectedLocale = detectLocale(acceptLanguage, locales) || fallbackLocale
    }

    // Determine if we should redirect or rewrite
    const shouldRedirect = detectedLocale !== defaultLocale || alwaysPrefixLocale

    const newPathname = pathname === '/' ? `/${detectedLocale}` : `/${detectedLocale}${pathname}`
    const url = request.nextUrl.clone()
    url.pathname = newPathname

    if (shouldRedirect) {
      // Redirect to explicit locale prefix
      return NextResponse.redirect(url)
    } else {
      // Rewrite for default locale (clean URL)
      return NextResponse.rewrite(url)
    }
  }
}

// Re-export for convenience
export { detectLocale } from '@i18n-tiny/core'

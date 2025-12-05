/**
 * @i18n-tiny/next/middleware
 *
 * Middleware for Next.js i18n routing
 *
 * @example
 * // proxy.ts
 * import { middleware } from '@i18n-tiny/next/middleware'
 * import { i18n } from './i18n'
 *
 * export const proxy = middleware(i18n)
 * export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] }
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { detectLocale } from '@i18n-tiny/core'

export interface MiddlewareConfig {
  /** Array of supported locales (e.g., ['en', 'ja']) */
  locales: readonly string[]
  /** Default locale to use when none is detected */
  defaultLocale: string
}

/**
 * Creates a Next.js proxy handler for i18n routing
 *
 * Behavior:
 * - If URL already has a locale prefix → pass through
 * - Otherwise → detect locale from Accept-Language header
 *   - If detected locale is in locales list → redirect to that locale
 *   - Otherwise → rewrite to default locale (URL stays the same)
 */
export function middleware (config: MiddlewareConfig) {
  const { locales, defaultLocale } = config

  return function middleware (request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if pathname already has a locale prefix
    const hasLocale = locales.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (hasLocale) {
      return NextResponse.next()
    }

    // Detect locale from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language')
    const detectedLocale = detectLocale(acceptLanguage, locales)

    // If detected locale is valid and not the default, redirect
    if (detectedLocale && detectedLocale !== defaultLocale) {
      const newPathname = pathname === '/' ? `/${detectedLocale}` : `/${detectedLocale}${pathname}`
      const url = request.nextUrl.clone()
      url.pathname = newPathname
      return NextResponse.redirect(url)
    }

    // For default locale (or no detection), rewrite to keep clean URL
    const newPathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`
    const url = request.nextUrl.clone()
    url.pathname = newPathname
    return NextResponse.rewrite(url)
  }
}

// Re-export for convenience
export { detectLocale } from '@i18n-tiny/core'

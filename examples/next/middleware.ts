import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { detectLocale } from '@i18n-tiny/core'
import { locales, defaultLocale } from './i18n'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (hasLocale) return NextResponse.next()

  const acceptLanguage = request.headers.get('accept-language')
  const locale = detectLocale(acceptLanguage, locales) ?? defaultLocale

  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}


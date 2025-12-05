'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps, ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo } from 'react'
import { resolveMessage } from '@i18n-tiny/core'

interface I18nContextValue {
  locale: string
  messages: Record<string, unknown>
  defaultLocale: string
  locales: readonly string[]
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function useI18n () {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('i18n hooks must be used within I18nProvider')
  }
  return context
}

export interface I18nProviderProps {
  locale: string
  messages: Record<string, unknown>
  defaultLocale: string
  locales: readonly string[]
  children: ReactNode
}

export function I18nProvider ({
  locale,
  messages,
  defaultLocale,
  locales,
  children
}: I18nProviderProps) {
  const value = useMemo(
    () => ({
      locale,
      messages,
      defaultLocale,
      locales
    }),
    [locale, messages, defaultLocale, locales]
  )

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useMessages<T = Record<string, unknown>> (): T {
  return useI18n().messages as T
}

export function useTranslations<K extends string = string> (namespace?: string): (key: K) => string {
  const { locale, messages } = useI18n()

  return useCallback(
    (key: K): string => {
      return resolveMessage(messages, key, namespace, locale)
    },
    [namespace, messages, locale]
  )
}

export function useLocale (): string {
  return useI18n().locale
}

export function useLocalizedPath () {
  const { locale, defaultLocale, locales } = useI18n()
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

export function useLocales (): readonly string[] {
  return useI18n().locales
}

export function I18nLink ({ href, ...props }: ComponentProps<typeof NextLink>) {
  const getPath = useLocalizedPath()

  // Handle both string and UrlObject
  const localizedHref = typeof href === 'string'
    ? getPath(href)
    : { ...href, pathname: getPath(href.pathname ?? '') }

  return <NextLink href={localizedHref} {...props} />
}

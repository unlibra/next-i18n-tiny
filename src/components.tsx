'use client'

import NextLink from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo } from 'react'

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
      const fullKey = namespace ? `${String(namespace)}.${key}` : key
      const keys = fullKey.split('.')
      let obj: unknown = messages

      for (const k of keys) {
        if (obj && typeof obj === 'object' && k in obj) {
          obj = (obj as Record<string, unknown>)[k]
        } else {
          obj = undefined
        }

        if (obj === undefined) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[i18n] Missing key: "${fullKey}" in locale "${locale}"`)
          }
          return fullKey
        }
      }

      return String(obj)
    },
    [namespace, messages, locale]
  )
}

export function useLocale (): string {
  return useI18n().locale
}

export function useLocalizedPath () {
  const { locale, defaultLocale } = useI18n()
  return useCallback(
    (path: string) => {
      if (locale === defaultLocale) {
        return path
      }
      return `/${locale}${path}`
    },
    [locale, defaultLocale]
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

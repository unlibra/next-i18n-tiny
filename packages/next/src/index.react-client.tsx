'use client'

import type { ReactNode } from 'react'

import { I18nLink, useLocale } from './components'
import {
  I18nProvider as BaseProvider,
  useMessages as baseUseMessages,
  useTranslations as baseUseTranslations
} from '@i18n-tiny/react'
import type { NestedKeys } from '@i18n-tiny/core'
import { resolveMessage } from '@i18n-tiny/core'

// Re-export core utilities
export { removeLocalePrefix } from '@i18n-tiny/core'

// Re-export from @i18n-tiny/react
export {
  useMessages,
  useTranslations,
  useLocales,
  useDefaultLocale
} from '@i18n-tiny/react'

export interface I18nConfig<
  L extends readonly string[],
  M extends Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  Msgs extends Record<L[number], M> = Record<L[number], M>
> {
  locales: L
  defaultLocale: L[number]
  messages: Msgs
}

/**
 * Define i18n instance with automatic type inference
 * This is a pure function that creates a self-contained i18n runtime
 *
 * @example
 * import { define } from '@i18n-tiny/next'
 * import jaMessages from './messages/ja'
 * import enMessages from './messages/en'
 *
 * export const i18n = define({
 *   locales: ['ja', 'en'] as const,
 *   defaultLocale: 'ja',
 *   messages: { ja: jaMessages, en: enMessages }
 * })
 *
 * // Server Component - types are automatically inferred
 * const messages = await i18n.server.getMessages(locale)
 * const t = await i18n.server.getTranslations(locale)
 *
 * // Layout
 * <i18n.Provider locale={locale} messages={messages}>
 *   {children}
 * </i18n.Provider>
 */
export function define<
  L extends readonly string[],
  M extends Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  Msgs extends Record<L[number], M>
> (config: { locales: L; defaultLocale: L[number]; messages: Msgs }) {
  const { locales, defaultLocale, messages } = config

  // Type aliases for automatic inference
  // Use the default locale's message type for consistent typing
  type MessageType = Msgs[L[0]]
  type MessageKeys = NestedKeys<MessageType>

  // Server API
  const server = {
    /**
     * Get messages object for server components
     * Types are automatically inferred from the messages passed to define
     */
    getMessages: async (locale: string): Promise<MessageType> => {
      const moduleObj = messages[locale as L[number]]
      // Convert ES module namespace to plain object (required for Client Components)
      return JSON.parse(JSON.stringify(moduleObj)) as MessageType
    },

    /**
     * Get translation function for server components
     * Keys are automatically inferred and provide autocomplete
     */
    getTranslations: async (
      locale: string,
      namespace?: string
    ): Promise<(key: MessageKeys) => string> => {
      const moduleObj = messages[locale as L[number]]
      const msgs = JSON.parse(JSON.stringify(moduleObj))

      return (key: MessageKeys): string => {
        return resolveMessage(msgs, key, namespace, locale)
      }
    },

    getLocalizedPath: (path: string, locale: string): string => {
      const cleanPath = path.startsWith('/') ? path : `/${path}`

      // Avoid double prefixing
      if (cleanPath.startsWith(`/${locale}/`) || cleanPath === `/${locale}`) {
        return cleanPath
      }

      // For default locale, no prefix needed
      if (locale === defaultLocale) {
        return cleanPath
      }

      // Add locale prefix for non-default locales
      return cleanPath === '/' ? `/${locale}` : `/${locale}${cleanPath}`
    },

    locales,
    defaultLocale
  }

  // Provider wrapper that only requires locale and messages
  function Provider ({ locale, messages: msgs, children }: {
    locale: string
    messages: MessageType
    children: ReactNode
  }) {
    return (
      <BaseProvider
        locale={locale}
        messages={msgs}
        defaultLocale={defaultLocale}
        locales={locales}
      >
        {children}
      </BaseProvider>
    )
  }

  // Type-safe wrappers for client hooks with automatic inference
  function useMessages (): MessageType {
    return baseUseMessages<MessageType>()
  }

  function useTranslations (namespace?: string): (key: MessageKeys) => string {
    return baseUseTranslations<MessageKeys>(namespace)
  }

  // Client API (hooks only)
  const client = {
    useMessages,
    useTranslations,
    useLocale,
    locales,
    defaultLocale
  }

  return {
    Provider,
    Link: I18nLink,
    server,
    client
  }
}

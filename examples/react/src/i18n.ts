import { define } from '@i18n-tiny/react'
import enMessages from './messages/en'
import jaMessages from './messages/ja'

export type Locale = 'en' | 'ja'
export const locales: Locale[] = ['en', 'ja']
export const defaultLocale: Locale = 'en'
export const messages = {
  en: enMessages,
  ja: jaMessages
}

export const { Provider, useLocale, useMessages, useTranslations } = define({
  locales,
  defaultLocale,
  messages
})

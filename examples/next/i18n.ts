import { define } from '@i18n-tiny/next'
import enMessages from './messages/en'
import jaMessages from './messages/ja'

export const { 
  client, 
  server, 
  Link, 
  Provider,
  locales,
  defaultLocale 
} = define({
  locales: ['en', 'ja'],
  defaultLocale: 'en',
  messages: {
    en: enMessages,
    ja: jaMessages
  }
})

export const { useMessages, useTranslations, useLocale } = client
export const { getMessages, getTranslations } = server

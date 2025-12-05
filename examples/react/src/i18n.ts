import { define } from '@i18n-tiny/react'
import enMessages from './messages/en'
import jaMessages from './messages/ja'

export const i18n = define({
  locales: ['en', 'ja'],
  defaultLocale: 'en',
  messages: {
    en: enMessages,
    ja: jaMessages
  }
})

import { defineMiddleware } from 'astro/middleware';
import { middleware as i18nMiddleware } from '@i18n-tiny/astro/middleware';
import { i18n } from './i18n';

export const onRequest = defineMiddleware(
  i18nMiddleware({
    locales: i18n.locales,
    defaultLocale: i18n.defaultLocale,
    strategy: 'redirect'
  })
);

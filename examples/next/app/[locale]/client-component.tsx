'use client'

import { useTranslations, Link, locales, useLocale } from '@/i18n'
import { removeLocalePrefix } from '@i18n-tiny/core'
import { usePathname } from 'next/navigation'

export default function ClientComponent() {
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()
  
  const pathWithoutLocale = removeLocalePrefix(pathname, locales)

  return (
    <div>
      <h2>Client Component</h2>
      <p>Current locale: <strong>{locale}</strong></p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        {locales.map(l => (
          <Link key={l} href={l === 'en' ? pathWithoutLocale : `/${l}${pathWithoutLocale}`}>
            {l === locale ? `✓ ${l.toUpperCase()}` : l.toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  )
}

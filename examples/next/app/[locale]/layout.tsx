import { Provider, getMessages, locales } from '@/i18n'
import { ReactNode } from 'react'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function Layout({ 
  children, 
  params 
}: { 
  children: ReactNode
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params
  const messages = await getMessages(locale)

  return (
    <Provider locale={locale} messages={messages}>
      {children}
    </Provider>
  )
}

import { getTranslations } from '@/i18n'
import ClientComponent from './client-component'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations(locale)

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>{t('home.welcome')}</h1>
      <p>{t('common.description')}</p>
      <hr style={{ margin: '2rem 0' }} />
      <ClientComponent />
    </main>
  )
}

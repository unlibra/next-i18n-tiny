import { useState } from 'react'
import { i18n } from './i18n'

function App() {
  const [locale, setLocale] = useState(i18n.defaultLocale)
  
  // In a real app, you might load messages lazily
  const messages = i18n.messages[locale]

  return (
    <i18n.Provider locale={locale} messages={messages}>
      <PageContent onToggleLocale={() => setLocale(l => l === 'en' ? 'ja' : 'en')} />
    </i18n.Provider>
  )
}

function PageContent({ onToggleLocale }: { onToggleLocale: () => void }) {
  const t = i18n.useTranslations()
  const locale = i18n.useLocale()

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>{t('home.welcome')}</h1>
      <p>{t('common.description')}</p>
      
      <hr style={{ margin: '2rem 0' }} />
      
      <p>Current locale: <strong>{locale}</strong></p>
      
      <button onClick={onToggleLocale}>
        {t('home.switch')}
      </button>
    </div>
  )
}

export default App

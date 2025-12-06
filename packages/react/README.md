# @i18n-tiny/react

[![npm version](https://img.shields.io/npm/v/@i18n-tiny/react.svg)](https://www.npmjs.com/package/@i18n-tiny/react)
[![npm downloads](https://img.shields.io/npm/dm/@i18n-tiny/react.svg)](https://www.npmjs.com/package/@i18n-tiny/react)

Tiny, type-safe i18n library for React with automatic type inference and zero dependencies.

## Installation

```bash
npm install @i18n-tiny/react
```

## Quick Start

### 1. Define i18n Instance

```typescript
// src/i18n.ts
import { define } from '@i18n-tiny/react'

const enMessages = {
  common: {
    title: 'Hello',
    welcome: 'Welcome, {name}!'
  }
} as const

const jaMessages = {
  common: {
    title: 'こんにちは',
    welcome: 'ようこそ、{name}さん！'
  }
} as const

export const i18n = define({
  locales: ['en', 'ja'] as const,
  defaultLocale: 'en',
  messages: {
    en: enMessages,
    ja: jaMessages
  }
})
```

### 2. Wrap Your App with Provider

```tsx
// src/App.tsx
import { useState } from 'react'
import { i18n } from './i18n'

const messages = {
  en: enMessages,
  ja: jaMessages
}

function App() {
  const [locale, setLocale] = useState('en')

  return (
    <i18n.Provider locale={locale} messages={messages[locale]}>
      <YourApp />
      <button onClick={() => setLocale(locale === 'en' ? 'ja' : 'en')}>
        Toggle Language
      </button>
    </i18n.Provider>
  )
}
```

### 3. Use in Components

```tsx
// src/components/Greeting.tsx
import { i18n } from '../i18n'

function Greeting() {
  const t = i18n.useTranslations()
  const messages = i18n.useMessages()
  const locale = i18n.useLocale()

  return (
    <div>
      <h1>{messages.common.title}</h1>
      <p>{t('common.welcome', { name: 'User' })}</p>
      <p>Current locale: {locale}</p>
    </div>
  )
}
```

## API Reference

### `define(config)`

Creates an i18n instance with type-safe hooks.

```typescript
const i18n = define({
  locales: ['en', 'ja'] as const,  // Supported locales
  defaultLocale: 'en',              // Default locale
  messages: { en: {...}, ja: {...} } // Message dictionaries
})
```

Returns:
- `Provider` - React context provider component
- `useMessages()` - Hook to access raw message object
- `useTranslations(namespace?)` - Hook to get translation function
- `useLocale()` - Hook to get current locale
- `locales` - Array of supported locales
- `defaultLocale` - Default locale string

### `Provider`

Wraps your app to provide i18n context.

```tsx
<i18n.Provider locale="en" messages={messages.en}>
  {children}
</i18n.Provider>
```

Props:
- `locale: string` - Current locale
- `messages: MessageType` - Message dictionary for current locale
- `children: ReactNode` - Child components

### `useMessages()`

Returns the raw message object with full type inference.

```tsx
const messages = i18n.useMessages()
// messages.common.title is typed as string
```

### `useTranslations(namespace?)`

Returns a translation function with interpolation support.

```tsx
const t = i18n.useTranslations()
t('common.welcome', { name: 'John' }) // "Welcome, John!"

// With namespace
const t = i18n.useTranslations('common')
t('welcome', { name: 'John' }) // "Welcome, John!"
```

### `useLocale()`

Returns the current locale string.

```tsx
const locale = i18n.useLocale() // "en" | "ja"
```

## TypeScript

Full type inference is automatic:

```typescript
const t = i18n.useTranslations()

// Type error: 'invalid.key' doesn't exist
t('invalid.key')

// Type error: missing required variable
t('common.welcome') // Error: expects { name: string }
```

## License

MIT

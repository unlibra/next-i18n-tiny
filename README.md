# i18n-tiny

[![CI](https://github.com/unlibra/i18n-tiny/workflows/CI/badge.svg)](https://github.com/unlibra/i18n-tiny/actions)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/unlibra/i18n-tiny/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

The simplest i18n library for modern frameworks. Type-safe, zero-dependency, minimal setup.

Currently supports: **Next.js** | **Astro** | **React**

## Quick Start

### Next.js

[![npm version](https://img.shields.io/npm/v/@i18n-tiny/next.svg)](https://www.npmjs.com/package/@i18n-tiny/next)
[![npm downloads](https://img.shields.io/npm/dm/@i18n-tiny/next.svg)](https://www.npmjs.com/package/@i18n-tiny/next)

```bash
npm install @i18n-tiny/next
```

```typescript
// i18n.ts
import { define } from '@i18n-tiny/next'
import { Link } from '@i18n-tiny/next/router'
import enMessages from './messages/en'
import jaMessages from './messages/ja'

const { client, server, Provider } = define({
  locales: ['en', 'ja'] as const,
  defaultLocale: 'en',
  messages: { en: enMessages, ja: jaMessages }
})

export { Link, Provider }
export const { useMessages, useTranslations, useLocale } = client
export const { getMessages, getTranslations } = server
```

```typescript
// proxy.ts
import { create } from '@i18n-tiny/next/proxy'

export const proxy = create({
  locales: ['en', 'ja'],
  defaultLocale: 'en'
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)*']
}
```

[Full documentation →](./packages/next/README.md)

### Astro

[![npm version](https://img.shields.io/npm/v/@i18n-tiny/astro.svg)](https://www.npmjs.com/package/@i18n-tiny/astro)
[![npm downloads](https://img.shields.io/npm/dm/@i18n-tiny/astro.svg)](https://www.npmjs.com/package/@i18n-tiny/astro)

```bash
npm install @i18n-tiny/astro
```

```typescript
// src/i18n.ts
import { define } from '@i18n-tiny/astro'
import enMessages from './messages/en'
import jaMessages from './messages/ja'

export const { locales, defaultLocale, getMessages, getTranslations } = define({
  locales: ['en', 'ja'] as const,
  defaultLocale: 'en',
  messages: { en: enMessages, ja: jaMessages }
})
```

```typescript
// src/middleware.ts
import { defineMiddleware } from 'astro/middleware'
import { create } from '@i18n-tiny/astro/middleware'

export const onRequest = defineMiddleware(
  create({
    locales: ['en', 'ja'],
    defaultLocale: 'en'
  })
)
```

[Full documentation →](./packages/astro/README.md)

### React

[![npm version](https://img.shields.io/npm/v/@i18n-tiny/react.svg)](https://www.npmjs.com/package/@i18n-tiny/react)
[![npm downloads](https://img.shields.io/npm/dm/@i18n-tiny/react.svg)](https://www.npmjs.com/package/@i18n-tiny/react)

```bash
npm install @i18n-tiny/react
```

```typescript
// src/i18n.ts
import { define } from '@i18n-tiny/react'
import enMessages from './messages/en'
import jaMessages from './messages/ja'

export const i18n = define({
  locales: ['en', 'ja'] as const,
  defaultLocale: 'en',
  messages: { en: enMessages, ja: jaMessages }
})
```

```tsx
// src/App.tsx
import { i18n } from './i18n'

function App() {
  const [locale, setLocale] = useState('en')
  return (
    <i18n.Provider locale={locale} messages={messages[locale]}>
      <YourApp />
    </i18n.Provider>
  )
}

// src/components/Greeting.tsx
function Greeting() {
  const t = i18n.useTranslations()
  return <h1>{t('common.title')}</h1>
}
```

[Full documentation →](./packages/react/README.md)

## Features

- **Type-safe**: Full TypeScript support with automatic type inference
- **Zero dependencies**: No external i18n libraries needed
- **Framework support**: Next.js, Astro, React
- **Small**: Minimal bundle size
- **No global state**: Pure function factory pattern

## Live Demo

The Next.js package is used at **[8px.app](https://8px.app)**.
You can try the language switcher in the header to see it in action.

Source code: [https://github.com/unlibra/8px.app](https://github.com/unlibra/8px.app)

## Development

This is a pnpm workspace monorepo.

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint
```

## License

MIT

# @i18n-tiny/astro

[![npm version](https://img.shields.io/npm/v/@i18n-tiny/astro.svg)](https://www.npmjs.com/package/@i18n-tiny/astro)
[![npm downloads](https://img.shields.io/npm/dm/@i18n-tiny/astro.svg)](https://www.npmjs.com/package/@i18n-tiny/astro)
[![CI](https://github.com/unlibra/i18n-tiny/workflows/CI/badge.svg)](https://github.com/unlibra/i18n-tiny/actions)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/unlibra/i18n-tiny/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

Type-safe, zero-dependency i18n library for Astro. Works with Astro 3.0+ and 4.0+.

Inspired by next-intl, designed for simplicity and type safety.

## Features

- **Type-safe**: Full TypeScript support with **automatic type inference** - autocomplete for `messages.site.name`, `t('common.title')`, and all nested keys
- **Zero dependencies**: No external i18n libraries needed
- **Server-first**: Native Astro server-side rendering support
- **Minimal SSG**: Works seamlessly with Astro's static site generation
- **Simple API**: Single configuration, minimal boilerplate
- **Small**: Minimal bundle size
- **Flexible**: Use with Astro's built-in i18n or standalone

## Installation

```bash
npm install @i18n-tiny/astro
# or
pnpm add @i18n-tiny/astro
# or
yarn add @i18n-tiny/astro
```

## Usage

Choose your preferred setup:

- **Option 1**: With Astro's built-in i18n (Recommended for Astro 4.0+) - Lighter bundle
- **Option 2**: Standalone (Works with Astro 3.0+) - More customizable

### Option 1: With Astro's Built-in i18n (Recommended)

Use Astro's official i18n routing with @i18n-tiny/astro for translations.

**Step 1: Configure Astro i18n**

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config'

export default defineConfig({
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    routing: {
      prefixDefaultLocale: false
    }
  }
})
```

**Step 2: Create message files**

```typescript
// src/messages/en.ts
export default {
  common: {
    title: "My Site",
    description: "Welcome to my site"
  },
  nav: {
    home: "Home",
    about: "About"
  }
}
```

```typescript
// src/messages/ja.ts
export default {
  common: {
    title: "マイサイト",
    description: "サイトへようこそ"
  },
  nav: {
    home: "ホーム",
    about: "概要"
  }
}
```

**Step 3: Define i18n instance**

```typescript
// src/i18n.ts
import { define } from '@i18n-tiny/astro'
import enMessages from './messages/en'
import jaMessages from './messages/ja'

// No need to specify locales/defaultLocale - Astro handles routing
export const i18n = define({
  messages: { en: enMessages, ja: jaMessages }
})

// Re-export utilities for convenience
export { removeLocalePrefix } from '@i18n-tiny/astro'
```

**Step 4: Use in components**

```astro
---
// src/pages/[locale]/index.astro

import { i18n } from '../../i18n'

// Astro.currentLocale is available in Astro 4.0+
const locale = Astro.currentLocale

/* Direct object access */
const messages = i18n.getMessages(locale)
/* Function call */
const t = i18n.getTranslations(locale)
---

<html lang={locale}>
  <head>
    <title>{messages.common.title}</title>
    {/*           ^^^^^ Auto-complete */}
  </head>
  <body>
    <h1>{messages.common.title}</h1>
    <p>{t('common.description')}</p>
    {/*    ^^^^^^^^^^^^^^^^^^ Auto-complete */}

    <nav>
      <a href={i18n.getLocalizedPath('/', locale)}>{t('nav.home')}</a>
      <a href={i18n.getLocalizedPath('/about', locale)}>{t('nav.about')}</a>
    </nav>
  </body>
</html>
```

### Option 2: Standalone (Works with any Astro version)

Complete i18n solution with built-in routing middleware.

**Step 1: Create message files**

Same as Option 1.

**Step 2: Define i18n instance**

```typescript
// src/i18n.ts
import { define } from '@i18n-tiny/astro'
import enMessages from './messages/en'
import jaMessages from './messages/ja'

export const locales = ['en', 'ja'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const i18n = define({
  locales,
  defaultLocale,
  messages: { en: enMessages, ja: jaMessages }
})
```

**Step 3: Setup middleware**

```typescript
// src/middleware.ts
import { defineMiddleware } from 'astro/middleware'
import { middleware } from '@i18n-tiny/astro/middleware'
import { locales, defaultLocale } from './i18n'

export const onRequest = defineMiddleware(
  middleware({
    locales,
    defaultLocale,
    strategy: 'redirect',
    detectLanguage: true,
    excludePaths: ['/api', '/_image']
  })
)
```

**Step 4: Use in components**

```astro
---
// src/pages/[locale]/index.astro

import { i18n } from '../../i18n'

const { locale } = Astro.params as { locale: string }

const messages = i18n.getMessages(locale)
const t = i18n.getTranslations(locale)
---

<html lang={locale}>
  <body>
    <h1>{messages.common.title}</h1>
    <p>{t('common.description')}</p>
  </body>
</html>
```

## Comparison

| Feature | Option 1 (Astro i18n) | Option 2 (Standalone) |
|---------|----------------------|----------------------|
| Astro version | 4.0+ required | 3.0+ supported |
| Bundle size | Smaller (no middleware) | Slightly larger |
| Configuration | Split (astro.config.mjs + i18n.ts) | Single file |
| Flexibility | Standard Astro patterns | Customizable middleware |
| Language detection | Via Astro | Via middleware |
| Maintenance | By Astro team | By @i18n-tiny |

## API Reference

### `define(config)`

Defines an i18n instance with automatic type inference.

**Parameters:**

- `config.locales` (optional) - Array of supported locales. Inferred from messages if not provided.
- `config.defaultLocale` (optional) - Default locale. Uses first locale if not provided.
- `config.messages` - Messages object keyed by locale

**Returns:**

```typescript
{
  locales,            // Array of supported locales
  defaultLocale,      // Default locale
  getMessages,        // Get messages object for a locale
  getTranslations,    // Get translation function for a locale
  getLocalizedPath    // Get localized path with locale prefix
}
```

### `getMessages(locale)`

Get the full messages object for a locale.

```typescript
const messages = i18n.getMessages(Astro.currentLocale)
console.log(messages.common.title) // "My Site"
```

### `getTranslations(locale, namespace?)`

Get a translation function for a locale. Optionally scoped to a namespace.

```typescript
const t = i18n.getTranslations(Astro.currentLocale)
console.log(t('common.title')) // "My Site"

// With namespace
const tCommon = i18n.getTranslations(Astro.currentLocale, 'common')
console.log(tCommon('title')) // "My Site"
```

### `getLocalizedPath(path, locale)`

Get a localized path with the appropriate locale prefix.

```typescript
// With default locale (en)
i18n.getLocalizedPath('/about', 'en') // "/about"

// With non-default locale
i18n.getLocalizedPath('/about', 'ja') // "/ja/about"
```

## Middleware (Option 2 only)

### `middleware(config)`

Creates an Astro middleware for automatic locale detection and routing.

```typescript
import { defineMiddleware } from 'astro/middleware'
import { middleware } from '@i18n-tiny/astro/middleware'

export const onRequest = defineMiddleware(
  middleware({
    locales: ['en', 'ja'],
    defaultLocale: 'en',
    strategy: 'redirect',
    detectLanguage: true,
    excludePaths: ['/api']
  })
)
```

**Options:**

- `locales` - Array of supported locales
- `defaultLocale` - Default locale
- `strategy` - `'redirect'` (302 redirect) or `'rewrite'` (URL stays the same). Default: `'redirect'`
- `detectLanguage` - Whether to detect language from Accept-Language header. Default: `true`
- `excludePaths` - Paths to exclude from i18n handling. Default: `[]`

### `removeLocalePrefix(pathname, locales)` (from `@i18n-tiny/core`)

Remove locale prefix from pathname. Useful for language switchers.

```typescript
import { removeLocalePrefix } from '@i18n-tiny/astro'

// Remove locale prefix from path
removeLocalePrefix('/ja/about', ['en', 'ja']) // '/about'
removeLocalePrefix('/ja', ['en', 'ja'])       // '/'
removeLocalePrefix('/about', ['en', 'ja'])    // '/about' (unchanged)
```

## Advanced Usage

### Language Switcher

Create a component to switch between languages while preserving the current path.

```astro
---
// src/components/LanguageSwitcher.astro
import { i18n, removeLocalePrefix } from '../i18n'

const locale = Astro.currentLocale ?? i18n.defaultLocale
const pathname = Astro.url.pathname

// Get base path without locale
const basePath = removeLocalePrefix(pathname, i18n.locales)

const localeNames: Record<string, string> = {
  en: 'English',
  ja: '日本語'
}
---

<nav>
  {i18n.locales.map((loc) => (
    <a
      href={i18n.getLocalizedPath(basePath, loc)}
      class:list={[{ active: loc === locale }]}
    >
      {localeNames[loc]}
    </a>
  ))}
</nav>

<style>
  nav { display: flex; gap: 1rem; }
  .active { font-weight: bold; }
</style>
```

### Static Site Generation (SSG)

For static sites, create pages for each locale using Astro's `getStaticPaths`:

```astro
---
// src/pages/[locale]/index.astro
import { i18n } from '../../i18n'

export function getStaticPaths() {
  return i18n.locales.map((locale) => ({
    params: { locale }
  }))
}

const { locale } = Astro.params
const messages = i18n.getMessages(locale)
---

<html lang={locale}>
  <body>
    <h1>{messages.common.title}</h1>
  </body>
</html>
```

### React Islands

For React components in Astro (islands), use `@i18n-tiny/react` (coming soon) or pass translations as props:

```astro
---
// src/pages/[locale]/index.astro
import { i18n } from '../../i18n'
import MyReactComponent from '../../components/MyReactComponent'

const locale = Astro.currentLocale
const messages = i18n.getMessages(locale)
---

<MyReactComponent
  client:load
  messages={messages}
  locale={locale}
/>
```

## Technical Notes

### Message Serialization

This library uses `JSON.parse(JSON.stringify())` to convert ES module namespace objects to plain objects, ensuring compatibility across different module systems.

### Astro.currentLocale

This library works best with Astro 4.0+ which provides `Astro.currentLocale` natively. For older versions, you'll need to extract the locale from the URL path manually or use the standalone middleware option.

## License

MIT

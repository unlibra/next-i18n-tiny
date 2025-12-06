# API Specification

設計者向けAPI仕様書。全パッケージのエクスポート一覧と詳細仕様。

## Package Overview

```
@i18n-tiny/core          - コア機能（DefineConfig type）
@i18n-tiny/core/middleware - ミドルウェア用（detectLocale）
@i18n-tiny/core/router   - ルーティング用（getLocalizedPath等）
@i18n-tiny/core/internal - 内部用（resolveMessage, NestedKeys）※非公開
@i18n-tiny/react         - React用（Provider, hooks）
@i18n-tiny/next          - Next.js用（RSC対応、proxy）
@i18n-tiny/astro         - Astro用（middleware）
```

---

## @i18n-tiny/core

### Exports

| Export | Kind | Description |
|--------|------|-------------|
| `DefineConfig` | type | `define()` の設定型 |

### `DefineConfig<L, M>`

```typescript
interface DefineConfig<L extends string, M extends Record<string, any>> {
  locales: readonly L[]
  defaultLocale: L
  messages: Record<L, M>
}
```

---

## @i18n-tiny/core/middleware

### Exports

| Export | Kind | Description |
|--------|------|-------------|
| `detectLocale` | function | Accept-Languageヘッダーからロケールを検出 |

### `detectLocale(acceptLanguage, supportedLocales)`

```typescript
function detectLocale(
  acceptLanguage: string | null,
  supportedLocales: readonly string[]
): string | null
```

---

## @i18n-tiny/core/router

### Exports

| Export | Kind | Description |
|--------|------|-------------|
| `getLocalizedPath` | function | ロケールプレフィックス付きパス生成 |
| `removeLocalePrefix` | function | パスからロケールプレフィックスを除去 |
| `hasLocalePrefix` | function | パスがロケールプレフィックスを持つか判定 |
| `getLinkHref` | function | Link用のhref計算（内部用） |

### `getLocalizedPath(path, locale, defaultLocale, prefixDefault?)`

```typescript
function getLocalizedPath(
  path: string,
  locale: string,
  defaultLocale: string,
  prefixDefault?: boolean
): string
```

### `removeLocalePrefix(pathname, locales)`

```typescript
function removeLocalePrefix(
  pathname: string,
  locales: readonly string[]
): string
```

### `hasLocalePrefix(pathname, locales)`

```typescript
function hasLocalePrefix(
  pathname: string,
  locales: readonly string[]
): boolean
```

### `getLinkHref(href, locale, currentPathname, locales, defaultLocale, prefixDefault?)`

```typescript
function getLinkHref(
  href: string,
  locale: string | undefined,
  currentPathname: string,
  locales: readonly string[],
  defaultLocale: string,
  prefixDefault?: boolean
): string
```

---

## @i18n-tiny/core/internal

**注意**: このサブパスは内部使用のみ。ユーザーには公開しない。

### Exports (Internal Only)

| Export | Kind | Description |
|--------|------|-------------|
| `resolveMessage` | function | メッセージ解決 |
| `NestedKeys` | type | ネストされたキーの型ユーティリティ |

---

## @i18n-tiny/react

### Exports

| Export | Kind | Description |
|--------|------|-------------|
| `define` | function | i18nインスタンス生成 |
| `DefineConfig` | type | re-export from core |
| `ProviderProps` | type | Providerのprops型 |

### `define(config)` Returns

```typescript
{
  Provider: React.FC<{
    locale: string
    messages: MessageType
    children: ReactNode
  }>
  useMessages: () => MessageType
  useTranslations: (namespace?: string) => TranslationFunction
  useLocale: () => string
  locales: readonly string[]
  defaultLocale: string
}
```

**注意**: `messages` は戻り値に含まれない。`useMessages()` や `useTranslations()` 経由でのみアクセス可能。Providerへのmessages渡しはユーザーが自分で管理する。

---

## @i18n-tiny/next

### Exports

| Export | Kind | Description |
|--------|------|-------------|
| `define` | function | i18nインスタンス生成（RSC対応） |
| `DefineConfig` | type | re-export from core |

### `define(config)` Returns

```typescript
{
  Provider: React.FC<{
    locale: string
    messages: MessageType
    children: ReactNode
  }>
  locales: readonly string[]
  defaultLocale: string
  server: {
    getMessages: (locale: string) => Promise<MessageType>
    getTranslations: (locale: string, namespace?: string) => Promise<TranslationFunction>
  }
  client: {
    useMessages: () => MessageType
    useTranslations: (namespace?: string) => TranslationFunction
    useLocale: () => string
  }
}
```

**注意**: `Link` は `define()` から返されない。`@i18n-tiny/next/router` から別途インポート。

---

## @i18n-tiny/next/proxy

### Exports

| Export | Kind | Description |
|--------|------|-------------|
| `create` | function | proxy/middleware生成 |
| `ProxyConfig` | type | `create()` の設定型 |

### `create(config)`

```typescript
function create(config: ProxyConfig): (request: NextRequest) => NextResponse
```

### `ProxyConfig`

```typescript
// Standard routing
interface StandardRoutingConfig {
  locales: readonly string[]
  defaultLocale: string
  fallbackLocale?: string      // default: defaultLocale
  prefixDefault?: boolean      // default: false
  detectLanguage?: boolean     // default: true
  routing?: never
}

// SSR rewrite routing
interface RewriteRoutingConfig {
  locales: readonly string[]
  defaultLocale: string
  fallbackLocale?: string      // default: defaultLocale
  routing: 'rewrite'
  prefixDefault?: never
  detectLanguage?: never
}

type ProxyConfig = StandardRoutingConfig | RewriteRoutingConfig
```

### Routing Behavior Matrix

| prefixDefault | detectLanguage | `/` の挙動 |
|---------------|----------------|-----------|
| `false` | `false` | fallbackLocaleを返す、検出なし |
| `false` | `true` | 検出→非デフォルトはリダイレクト、デフォルトはrewrite |
| `true` | `false` | `/[defaultLocale]` へリダイレクト |
| `true` | `true` | 検出→検出されたロケールへリダイレクト |

---

## @i18n-tiny/next/router

### Exports

| Export | Kind | Description |
|--------|------|-------------|
| `Link` | component | ローカライズ対応Linkコンポーネント |

### `Link` Props

```typescript
interface LinkProps extends NextLinkProps {
  locale?: string  // 明示的ロケール指定、'' で生パス
  // ... NextLinkProps
}
```

**注意**: `getLocalizedPath`, `removeLocalePrefix` は re-export しない。必要なら `@i18n-tiny/core/router` から直接インポート。

---

## @i18n-tiny/astro

### Exports

| Export | Kind | Description |
|--------|------|-------------|
| `define` | function | i18nインスタンス生成 |
| `DefineConfig` | type | re-export from core |

### `define(config)` Returns

```typescript
{
  locales: readonly string[]
  defaultLocale: string
  getMessages: (locale: string | undefined) => MessageType
  getTranslations: (locale: string | undefined, namespace?: string) => TranslationFunction
}
```

**注意**: Astroの `define()` は `Provider` を返さない（Astroはサーバーファースト）。

---

## @i18n-tiny/astro/middleware

### Exports

| Export | Kind | Description |
|--------|------|-------------|
| `create` | function | middleware生成 |
| `MiddlewareConfig` | type | `create()` の設定型 |

### `create(config)`

```typescript
function create(config: MiddlewareConfig): MiddlewareHandler
```

### `MiddlewareConfig`

```typescript
// Standard routing
interface StandardRoutingConfig {
  locales: readonly string[]
  defaultLocale: string
  fallbackLocale?: string      // default: defaultLocale
  excludePaths?: string[]      // default: []
  prefixDefault?: boolean      // default: false
  detectLanguage?: boolean     // default: true
  routing?: never
}

// SSR rewrite routing
interface RewriteRoutingConfig {
  locales: readonly string[]
  defaultLocale: string
  fallbackLocale?: string      // default: defaultLocale
  excludePaths?: string[]      // default: []
  routing: 'rewrite'
  prefixDefault?: never
  detectLanguage?: never
}

type MiddlewareConfig = StandardRoutingConfig | RewriteRoutingConfig
```

**Astro固有オプション**: `excludePaths` - 処理をスキップするパス（例: `['/api', '/_image']`）

---

## @i18n-tiny/astro/router

### Exports

| Export | Kind | Description |
|--------|------|-------------|
| `Link.astro` | component | ローカライズ対応Linkコンポーネント |

### `Link.astro` Props

```astro
---
interface Props {
  href: string
  locale?: string  // 明示的ロケール指定、'' で生パス
  [key: string]: any  // その他のHTML属性
}
---
```

---

## Design Decisions

### 1. `Link` は `define()` から返さない

- `Link` はコンテキストに依存しない独立したコンポーネント
- URLから自動でロケールを検出する
- `define()` の設定（locales, defaultLocale）はURLパターンから推測可能

### 2. Router utilities は core/router から直接インポート

- `getLocalizedPath`, `removeLocalePrefix` はヘビーユーザー向け
- パッケージ間でre-exportせず、`@i18n-tiny/core/router` から直接使用
- APIサーフェスを最小限に保つ

### 3. Astro は `Provider` を返さない

- Astroはサーバーファーストアーキテクチャ
- クライアントコンテキストは不要
- `getMessages`, `getTranslations` を直接使用

### 4. Next.js の `server` と `client` 分離

- RSC環境では `client` APIがエラーをスロー
- 明示的な分離で誤用を防止
- `server` はPromiseを返す（async/await対応）

### 5. Config型の命名

- `DefineConfig` - `define()` 関数用
- `ProxyConfig` - Next.js `create()` 用
- `MiddlewareConfig` - Astro `create()` 用

### 6. core の subpath 構造

- `/` - `DefineConfig` のみ（define用の型）
- `/middleware` - `detectLocale`（ミドルウェア層のロジック）
- `/router` - パス操作関数群
- `/internal` - 非公開（`resolveMessage`, `NestedKeys`）

---

## Internal Types (Not Exported Publicly)

以下は内部使用のみ。ドキュメントには記載するがユーザーには公開しない。

| Type | Package | Purpose |
|------|---------|---------|
| `NestedKeys<T>` | core/internal | メッセージキーの型推論 |
| `TranslationFunction` | all | `t()` 関数の型 |
| `resolveMessage` | core/internal | キー解決とinterpolation |


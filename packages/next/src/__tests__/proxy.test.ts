import { describe, it, expect, vi, beforeEach } from 'vitest'
import { create } from '../proxy'

// Mock next/server
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({ type: 'next' })),
    redirect: vi.fn((url) => ({ type: 'redirect', url })),
    rewrite: vi.fn((url) => ({ type: 'rewrite', url }))
  }
}))

import { NextResponse } from 'next/server'

const createMockRequest = (pathname: string, acceptLanguage?: string) => ({
  nextUrl: {
    pathname,
    clone: () => ({
      pathname
    })
  },
  headers: {
    get: (name: string) => name === 'accept-language' ? acceptLanguage ?? null : null
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any

describe('create (proxy)', () => {
  const config = {
    locales: ['en', 'ja', 'fr'] as const,
    defaultLocale: 'en'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when URL already has locale prefix', () => {
    it('should pass through for /en path', () => {
      const proxy = create(config)
      const request = createMockRequest('/en')

      proxy(request)

      expect(NextResponse.next).toHaveBeenCalled()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
      expect(NextResponse.rewrite).not.toHaveBeenCalled()
    })

    it('should pass through for /ja/about path', () => {
      const proxy = create(config)
      const request = createMockRequest('/ja/about')

      proxy(request)

      expect(NextResponse.next).toHaveBeenCalled()
    })

    it('should pass through for /fr path', () => {
      const proxy = create(config)
      const request = createMockRequest('/fr')

      proxy(request)

      expect(NextResponse.next).toHaveBeenCalled()
    })
  })

  describe('when URL has no locale prefix', () => {
    it('should rewrite to default locale when no Accept-Language', () => {
      const proxy = create(config)
      const request = createMockRequest('/about')

      proxy(request)

      expect(NextResponse.rewrite).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.rewrite).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/en/about')
    })

    it('should rewrite root to default locale', () => {
      const proxy = create(config)
      const request = createMockRequest('/')

      proxy(request)

      expect(NextResponse.rewrite).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.rewrite).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/en')
    })

    it('should redirect to detected locale when not default', () => {
      const proxy = create(config)
      const request = createMockRequest('/about', 'ja,en;q=0.8')

      proxy(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.redirect).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/ja/about')
    })

    it('should redirect root to detected locale', () => {
      const proxy = create(config)
      const request = createMockRequest('/', 'fr')

      proxy(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.redirect).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/fr')
    })

    it('should rewrite to default locale when Accept-Language matches default', () => {
      const proxy = create(config)
      const request = createMockRequest('/about', 'en-US,en;q=0.9')

      proxy(request)

      expect(NextResponse.rewrite).toHaveBeenCalled()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
    })

    it('should rewrite to default locale when Accept-Language has no match', () => {
      const proxy = create(config)
      const request = createMockRequest('/about', 'de,ko;q=0.8')

      proxy(request)

      expect(NextResponse.rewrite).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.rewrite).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/en/about')
    })
  })

  describe('alwaysPrefixLocale option', () => {
    it('should redirect to /en when alwaysPrefixLocale is true and locale is default', () => {
      const proxy = create({
        ...config,
        alwaysPrefixLocale: true
      })
      const request = createMockRequest('/', 'en-US')

      proxy(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.redirect).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/en')
    })

    it('should redirect to /en/about when alwaysPrefixLocale is true', () => {
      const proxy = create({
        ...config,
        alwaysPrefixLocale: true
      })
      const request = createMockRequest('/about')

      proxy(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.redirect).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/en/about')
    })

    it('should rewrite when alwaysPrefixLocale is false (default)', () => {
      const proxy = create({
        ...config,
        alwaysPrefixLocale: false
      })
      const request = createMockRequest('/about', 'en-US')

      proxy(request)

      expect(NextResponse.rewrite).toHaveBeenCalled()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
    })
  })

  describe('fallbackLocale option', () => {
    it('should use fallbackLocale when no match found', () => {
      const proxy = create({
        ...config,
        fallbackLocale: 'ja'
      })
      const request = createMockRequest('/about', 'de,ko;q=0.8')

      proxy(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.redirect).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/ja/about')
    })

    it('should use fallbackLocale when no Accept-Language header', () => {
      const proxy = create({
        ...config,
        fallbackLocale: 'fr'
      })
      const request = createMockRequest('/')

      proxy(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.redirect).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/fr')
    })

    it('should default to defaultLocale when fallbackLocale not specified', () => {
      const proxy = create(config)
      const request = createMockRequest('/about', 'de,ko;q=0.8')

      proxy(request)

      expect(NextResponse.rewrite).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.rewrite).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/en/about')
    })
  })

  describe('detectLanguage option', () => {
    it('should ignore Accept-Language when detectLanguage is false', () => {
      const proxy = create({
        ...config,
        detectLanguage: false
      })
      const request = createMockRequest('/about', 'ja,en;q=0.8')

      proxy(request)

      expect(NextResponse.rewrite).toHaveBeenCalled()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
      const call = vi.mocked(NextResponse.rewrite).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/en/about')
    })

    it('should use fallbackLocale when detectLanguage is false', () => {
      const proxy = create({
        ...config,
        detectLanguage: false,
        fallbackLocale: 'fr'
      })
      const request = createMockRequest('/', 'ja')

      proxy(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.redirect).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/fr')
    })

    it('should detect language when detectLanguage is true (default)', () => {
      const proxy = create(config)
      const request = createMockRequest('/about', 'ja')

      proxy(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.redirect).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/ja/about')
    })
  })
})

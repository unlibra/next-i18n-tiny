import { describe, it, expect, vi, beforeEach } from 'vitest'
import { middleware } from '../middleware'

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

describe('middleware', () => {
  const config = {
    locales: ['en', 'ja', 'fr'] as const,
    defaultLocale: 'en'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when URL already has locale prefix', () => {
    it('should pass through for /en path', () => {
      const proxy = middleware(config)
      const request = createMockRequest('/en')

      proxy(request)

      expect(NextResponse.next).toHaveBeenCalled()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
      expect(NextResponse.rewrite).not.toHaveBeenCalled()
    })

    it('should pass through for /ja/about path', () => {
      const proxy = middleware(config)
      const request = createMockRequest('/ja/about')

      proxy(request)

      expect(NextResponse.next).toHaveBeenCalled()
    })

    it('should pass through for /fr path', () => {
      const proxy = middleware(config)
      const request = createMockRequest('/fr')

      proxy(request)

      expect(NextResponse.next).toHaveBeenCalled()
    })
  })

  describe('when URL has no locale prefix', () => {
    it('should rewrite to default locale when no Accept-Language', () => {
      const proxy = middleware(config)
      const request = createMockRequest('/about')

      proxy(request)

      expect(NextResponse.rewrite).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.rewrite).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/en/about')
    })

    it('should rewrite root to default locale', () => {
      const proxy = middleware(config)
      const request = createMockRequest('/')

      proxy(request)

      expect(NextResponse.rewrite).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.rewrite).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/en')
    })

    it('should redirect to detected locale when not default', () => {
      const proxy = middleware(config)
      const request = createMockRequest('/about', 'ja,en;q=0.8')

      proxy(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.redirect).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/ja/about')
    })

    it('should redirect root to detected locale', () => {
      const proxy = middleware(config)
      const request = createMockRequest('/', 'fr')

      proxy(request)

      expect(NextResponse.redirect).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.redirect).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/fr')
    })

    it('should rewrite to default locale when Accept-Language matches default', () => {
      const proxy = middleware(config)
      const request = createMockRequest('/about', 'en-US,en;q=0.9')

      proxy(request)

      expect(NextResponse.rewrite).toHaveBeenCalled()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
    })

    it('should rewrite to default locale when Accept-Language has no match', () => {
      const proxy = middleware(config)
      const request = createMockRequest('/about', 'de,ko;q=0.8')

      proxy(request)

      expect(NextResponse.rewrite).toHaveBeenCalled()
      const call = vi.mocked(NextResponse.rewrite).mock.calls[0][0] as { pathname: string }
      expect(call.pathname).toBe('/en/about')
    })
  })
})

import { describe, it, expect } from 'vitest'
import { removeLocalePrefix } from '../removeLocalePrefix'

const locales = ['en', 'ja', 'fr'] as const

describe('removeLocalePrefix', () => {
  it('should remove locale prefix from path', () => {
    expect(removeLocalePrefix('/en/about', locales)).toBe('/about')
    expect(removeLocalePrefix('/ja/contact', locales)).toBe('/contact')
    expect(removeLocalePrefix('/fr/nested/path', locales)).toBe('/nested/path')
  })

  it('should return root for locale-only path', () => {
    expect(removeLocalePrefix('/en', locales)).toBe('/')
    expect(removeLocalePrefix('/ja', locales)).toBe('/')
  })

  it('should return path unchanged if no locale prefix', () => {
    expect(removeLocalePrefix('/about', locales)).toBe('/about')
    expect(removeLocalePrefix('/', locales)).toBe('/')
    expect(removeLocalePrefix('/de/about', locales)).toBe('/de/about')
  })

  it('should handle edge cases', () => {
    expect(removeLocalePrefix('/en/', locales)).toBe('/')
    expect(removeLocalePrefix('/ja/', locales)).toBe('/')
  })
})

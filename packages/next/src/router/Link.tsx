'use client'

import NextLink from 'next/link'
import type { ComponentProps } from 'react'
import { useLocalizedPath } from './useLocalizedPath'

/**
 * Next.js Link component with automatic locale prefix
 *
 * @example
 * ```tsx
 * import { Link } from '@i18n-tiny/next/router'
 *
 * <Link href="/about">About</Link>
 * ```
 */
export function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const getPath = useLocalizedPath()

  // Handle both string and UrlObject
  const localizedHref = typeof href === 'string'
    ? getPath(href)
    : { ...href, pathname: getPath(href.pathname ?? '') }

  return <NextLink href={localizedHref} {...props} />
}

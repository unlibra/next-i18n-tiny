import { defineConfig } from 'tsup'

const sharedConfig = {
  format: ['cjs', 'esm'] as const,
  dts: true,
  sourcemap: true,
  external: ['astro', '@i18n-tiny/core'],
  splitting: false,
  treeshake: true,
  outExtension ({ format }: { format: 'cjs' | 'esm' }) {
    return {
      js: format === 'esm' ? '.js' : '.cjs'
    }
  }
}

export default defineConfig([
  // Main entry
  {
    ...sharedConfig,
    entry: {
      index: 'src/index.ts'
    },
    clean: true
  },
  // Middleware entry
  {
    ...sharedConfig,
    entry: {
      middleware: 'src/middleware.ts'
    },
    clean: false
  }
])

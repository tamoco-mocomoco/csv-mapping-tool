import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/csv-mapping-tool/',
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, '../core/src'),
    },
  },
  test: {
    exclude: ['node_modules', 'e2e'],
    include: ['src/**/*.test.ts', '../core/src/**/*.test.ts'],
  },
})

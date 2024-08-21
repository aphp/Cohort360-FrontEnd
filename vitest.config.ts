import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        globals: true,
        environment: 'jsdom', // tells Vitest to run our tests in a mock browser environment rather than the default Node environment
        setupFiles: './src/__tests__/setup.ts',
        coverage: {
          provider: 'v8',
          reporter: ['text', 'lcov', 'html']
        }
      }
    })
  )
)

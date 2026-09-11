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
          reporter: ['text', 'lcov', 'html'],
          // Ne mesurer que le code source applicatif: on exclut les artefacts de build,
          // la configuration, les tests, les types, les stories et les fichiers de style.
          include: ['src/**/*.{ts,tsx}'],
          exclude: [
            'src/**/*.test.{ts,tsx}',
            'src/**/*.spec.{ts,tsx}',
            'src/**/*.stories.{ts,tsx}',
            'src/**/*.d.ts',
            'src/**/__tests__/**',
            'src/**/styles.{ts,tsx}',
            'src/**/*.styles.{ts,tsx}'
          ]
        }
      }
    })
  )
)

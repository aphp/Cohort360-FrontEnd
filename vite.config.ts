import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build'
    },
    resolve: {
      alias: {
        '~': resolve(__dirname, 'src')
      }
    },
    plugins: [react(), tsconfigPaths()]
  }
})

import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// Resolve from project root (cwd when Vite loads this file).
const src = path.resolve(process.cwd(), 'src')

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': src,
    },
  },
})

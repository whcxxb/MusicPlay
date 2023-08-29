import Unocss from 'unocss/vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [
    vue(),
    Unocss({
      configFile: './unocss.config.ts'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5172,
    hmr: true
  }
})

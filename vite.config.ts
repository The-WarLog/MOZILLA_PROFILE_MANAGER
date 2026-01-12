import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import {
  copyFileSync,
  cpSync,
  existsSync,
  renameSync,
  rmSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        // Move HTML files from nested folders to root
        if (existsSync('dist/src/popup/popup.html')) {
          copyFileSync('dist/src/popup/popup.html', 'dist/popup.html')
        }
        if (existsSync('dist/src/Options/options.html')) {
          copyFileSync('dist/src/Options/options.html', 'dist/options.html')
        }

        // Remove src folder after copying
        if (existsSync('dist/src')) {
          rmSync('dist/src', { recursive: true, force: true })
        }

        // Fix HTML paths to be relative (remove leading slashes)
        ;['dist/popup.html', 'dist/options.html'].forEach((file) => {
          if (existsSync(file)) {
            let content = readFileSync(file, 'utf-8')
            content = content.replace(/src="\/([^"]+)"/g, 'src="./$1"')
            content = content.replace(/href="\/([^"]+)"/g, 'href="./$1"')
            writeFileSync(file, content)
          }
        })

        // Copy manifest
        copyFileSync('manifest.json', 'dist/manifest.json')

        // Copy assets folder
        if (existsSync('assets')) {
          cpSync('assets', 'dist/assets', { recursive: true })
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        options: resolve(__dirname, 'src/Options/options.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          // Keep HTML files at root
          if (assetInfo.name?.endsWith('.html')) {
            return '[name][extname]'
          }
          return '[name][extname]'
        },
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Code-split: separa las librerías pesadas del bundle principal para
    // mejorar TTI en móvil (el bundle único era 1.34 MB, gzip ~415 KB).
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf': ['pdfjs-dist'],
          'ocr': ['tesseract.js'],
          'motion': ['framer-motion'],
          'markdown': ['react-markdown', 'remark-gfm', 'rehype-raw'],
          'router': ['react-router-dom'],
        },
      },
    },
  },
})

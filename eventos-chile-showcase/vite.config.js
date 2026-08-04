// vite.config.js
// Configuración "Fail-Safe" para React + Vite
// Estrategia: Vendor Chunking Simple - Todo en un solo chunk para garantizar orden de ejecución
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [react()],
    base: '/',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            output: {
                // ESTRATEGIA: Code Splitting Conservador
                // CRÍTICO: NO separar React/React-DOM para evitar problemas de orden de carga
                // Solo separar Three.js que es muy pesado y no es crítico para el inicio
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        // Separar SOLO Three.js y react-three/fiber (muy pesados, no críticos)
                        if (id.includes('three') || id.includes('@react-three')) {
                            return 'vendor-three';
                        }
                        // CRÍTICO: React, React-DOM y framer-motion deben estar en vendor principal
                        // para garantizar orden de carga correcto
                        // Resto de dependencias (incluyendo React) van a vendor
                        return 'vendor';
                    }
                },
                // Optimizar nombres de chunks
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
        css: true,
        coverage: {
            reporter: ['text', 'json', 'html'],
        },
    }
})

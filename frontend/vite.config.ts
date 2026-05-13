import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_ORIGIN ?? 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
    // Disable caching in dev server
    middlewareMode: false,
    // Ensure hot reload works properly
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    // Force refresh on module change
    watch: {
      usePolling: true,
    },
  },
  build: {
    // Enable code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'recharts': ['recharts'],
          'react-router': ['react-router-dom'],
        },
      },
    },
    // Optimize for performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Source maps for production debugging
    sourcemap: false,
    // Target modern browsers for smaller bundle
    target: 'ES2020',
    // Output directory
    outDir: 'dist',
    // Assets base
    assetsDir: 'assets',
    // Inline small assets
    assetsInlineLimit: 4096,
    // CSS code splitting
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      'framer-motion',
      'lucide-react',
    ],
    exclude: ['@vite/preload-helper'],
  },
})

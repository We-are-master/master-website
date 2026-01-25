import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'gsap-vendor': ['gsap'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'maps-vendor': ['@react-google-maps/api', 'use-places-autocomplete'],
          'toast-vendor': ['react-toastify']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // Enable minification and compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    },
    // Optimize chunk size
    cssCodeSplit: true,
    // Source maps for better debugging (disable in production for smaller bundles)
    sourcemap: false
  }
})

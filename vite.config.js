import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Relative asset paths so app works from any hosting directory / subdirectory
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'icon-180.png'],
      manifest: {
        name: 'MathFlow',
        short_name: 'MathFlow',
        description: 'Master mental arithmetic — works offline',
        theme_color: '#080808',
        background_color: '#080808',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icon-180.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // Pre-cache all build output (JS, CSS, HTML, images)
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Cache Google Fonts for fully offline use
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gfonts-stylesheets',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gfonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    // Use src/index.html as the stable entry so root index.html stays as
    // the deployed output and never gets treated as a stale build artifact
    rollupOptions: { input: './src/index.html' },
    outDir: 'dist',
    emptyOutDir: true,
  },
})

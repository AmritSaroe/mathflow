// Copies the Vite build output (dist/) to the project root so it can be
// served directly by a static file server without any build step.
import { cpSync, rmSync, readdirSync, existsSync } from 'fs'

// Clean old build artifacts from root before replacing them
const stale = ['assets', 'sw.js', 'manifest.webmanifest', 'registerSW.js']
for (const f of stale) {
  if (existsSync(f)) rmSync(f, { force: true, recursive: true })
}
// Remove old workbox runtime files (workbox-xxxxxxxx.js)
for (const f of readdirSync('.')) {
  if (f.startsWith('workbox-') && f.endsWith('.js')) rmSync(f, { force: true })
}

// Shallow-copy everything from dist/ → project root
cpSync('dist', '.', { recursive: true, force: true })
console.log('✓ dist/ deployed to project root')

// Copies the Vite build output (dist/) to the project root so it can be
// served directly by a static file server without any build step.
//
// Vite uses src/index.html as the entry point, so the built HTML lands at
// dist/src/index.html.  We hoist it to dist/index.html before copying.
import { cpSync, rmSync, renameSync, readdirSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Hoist dist/src/index.html → dist/index.html (Vite puts it in a subdir
// when the input lives under src/)
const builtInSrc = 'dist/src/index.html'
if (existsSync(builtInSrc)) {
  renameSync(builtInSrc, 'dist/index.html')
  // Remove the now-empty dist/src/ directory if nothing else is in it
  try { rmSync('dist/src', { recursive: true }) } catch {}
}

// Clean old build artifacts from project root before replacing them
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

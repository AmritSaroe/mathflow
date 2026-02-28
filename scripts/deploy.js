// Copies the Vite build output (dist/) to the project root so it can be
// served directly by a static file server without any build step.
//
// Vite uses src/index.html as the entry point, so the built HTML lands at
// dist/src/index.html.  We hoist it to dist/index.html before copying.
import { cpSync, rmSync, renameSync, readdirSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { createHash } from 'crypto'
import { join } from 'path'

// Hoist dist/src/index.html → dist/index.html (Vite puts it in a subdir
// when the input lives under src/)
const builtInSrc = 'dist/src/index.html'
if (existsSync(builtInSrc)) {
  renameSync(builtInSrc, 'dist/index.html')
  // Fix asset paths: Vite generates ../assets/ relative to dist/src/,
  // but after hoisting to dist/index.html the correct path is ./assets/
  const fixedHtml = readFileSync('dist/index.html', 'utf8')
    .replaceAll('src="../', 'src="./')
    .replaceAll('href="../', 'href="./')
  writeFileSync('dist/index.html', fixedHtml)

  // Patch dist/sw.js: the PWA plugin precached the file as "src/index.html"
  // (its path before hoisting).  After renaming, the deployed URL is
  // "index.html", so fix both the url key and the revision hash so
  // createHandlerBoundToURL("index.html") can find it in the precache.
  const swPath = 'dist/sw.js'
  if (existsSync(swPath)) {
    const newRevision = createHash('md5').update(fixedHtml).digest('hex')
    const swContent = readFileSync(swPath, 'utf8')
      .replace(
        /\{url:"src\/index\.html",revision:"[^"]*"\}/,
        `{url:"index.html",revision:"${newRevision}"}`
      )
    writeFileSync(swPath, swContent)
    console.log(`✓ sw.js patched: src/index.html → index.html (${newRevision})`)
  }

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

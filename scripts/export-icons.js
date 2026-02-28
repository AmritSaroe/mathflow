import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root   = dirname(dirname(fileURLToPath(import.meta.url)))
const svgBuf = readFileSync(join(root, 'logo.svg'))
const outDir = join(root, 'public', 'icons')

const SIZES = [48, 72, 96, 128, 180, 192, 512]

await Promise.all(
  SIZES.map(size =>
    sharp(svgBuf)
      .resize(size, size)
      .png()
      .toFile(join(outDir, `icon-${size}.png`))
      .then(() => console.log(`✓ icon-${size}.png`))
  )
)

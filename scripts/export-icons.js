import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root   = dirname(dirname(fileURLToPath(import.meta.url)))
const svgStr = readFileSync(join(root, 'logo.svg'), 'utf8')
const outDir = join(root, 'public', 'icons')

const SIZES = [48, 72, 96, 128, 192, 512]

for (const size of SIZES) {
  const resvg = new Resvg(svgStr, {
    fitTo: { mode: 'width', value: size },
  })
  const pngData = resvg.render().asPng()
  const outPath = join(outDir, `icon-${size}.png`)
  writeFileSync(outPath, pngData)
  console.log(`✓ icon-${size}.png`)
}

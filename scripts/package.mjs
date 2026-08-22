/** Packs dist/ into a Chrome Web Store upload zip in release/. */
import JSZip from 'jszip'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const manifest = JSON.parse(readFileSync('dist/manifest.json', 'utf8'))
const zip = new JSZip()

function addDir(dir, prefix = '') {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      addDir(path, `${prefix}${entry.name}/`)
    } else {
      zip.file(`${prefix}${entry.name}`, readFileSync(path))
    }
  }
}

addDir('dist')
const buffer = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 9 },
})

mkdirSync('release', { recursive: true })
const outfile = `release/artifact-downloader-for-claude-${manifest.version}.zip`
writeFileSync(outfile, buffer)
console.log(`${outfile} (${(buffer.length / 1024).toFixed(1)} kB)`)

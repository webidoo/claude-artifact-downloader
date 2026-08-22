/** Bundles the extension into dist/ (load it unpacked from there). */
import { build } from 'esbuild'
import { cpSync, mkdirSync, rmSync } from 'node:fs'

const outdir = 'dist'
rmSync(outdir, { recursive: true, force: true })
mkdirSync(outdir, { recursive: true })

// Content scripts cannot be ES modules, so every entry is bundled as an IIFE.
const entries = {
  content: 'content',
  background: 'background',
  popup: 'popup',
  'frame-content': 'frameContent',
}
for (const [outName, srcName] of Object.entries(entries)) {
  await build({
    entryPoints: [`src/${srcName}.ts`],
    outfile: `${outdir}/${outName}.js`,
    bundle: true,
    format: 'iife',
    target: 'chrome110',
    logLevel: 'info',
  })
}

cpSync('manifest.json', `${outdir}/manifest.json`)
cpSync('src/popup.html', `${outdir}/popup.html`)
cpSync('icons', `${outdir}/icons`, { recursive: true })

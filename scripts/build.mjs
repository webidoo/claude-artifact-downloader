/** Bundles the extension into dist/ (load it unpacked from there). */
import { build } from 'esbuild'
import { cpSync, mkdirSync, rmSync } from 'node:fs'

const outdir = 'dist'
rmSync(outdir, { recursive: true, force: true })
mkdirSync(outdir, { recursive: true })

// Content scripts cannot be ES modules, so every entry is bundled as an IIFE.
for (const entry of ['content', 'background', 'popup']) {
  await build({
    entryPoints: [`src/${entry}.ts`],
    outfile: `${outdir}/${entry}.js`,
    bundle: true,
    format: 'iife',
    target: 'chrome110',
    logLevel: 'info',
  })
}

cpSync('manifest.json', `${outdir}/manifest.json`)
cpSync('src/popup.html', `${outdir}/popup.html`)
cpSync('icons', `${outdir}/icons`, { recursive: true })

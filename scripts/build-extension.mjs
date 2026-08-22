/** Bundles the browser extension into extension/dist (load it unpacked from there). */
import { build } from 'esbuild'
import { cpSync, mkdirSync } from 'node:fs'

const outdir = 'extension/dist'
mkdirSync(outdir, { recursive: true })

// Content scripts cannot be ES modules, so both entries are bundled as IIFEs.
for (const entry of ['content', 'background']) {
  await build({
    entryPoints: [`extension/src/${entry}.ts`],
    outfile: `${outdir}/${entry}.js`,
    bundle: true,
    format: 'iife',
    target: 'chrome110',
    logLevel: 'info',
  })
}

cpSync('extension/manifest.json', `${outdir}/manifest.json`)

import { describe, expect, it } from 'vitest'
import { buildProject, extractTitle, slugify, splitInlineAssets } from './htmlProject'

const SAMPLE = `<!doctype html><html><head><title>My Demo App</title>
<style>body { color: red; }</style>
<script type="application/json">{"data": 1}</script>
</head><body>
<h1>Hello</h1>
<script>console.log('hi')</script>
<script type="module">export {}</script>
<script src="https://example.com/lib.js"></script>
</body></html>`

describe('extractTitle', () => {
  it('reads the document title', () => {
    expect(extractTitle(SAMPLE)).toBe('My Demo App')
  })

  it('returns null when missing or empty', () => {
    expect(extractTitle('<html></html>')).toBeNull()
    expect(extractTitle('<title>  </title>')).toBeNull()
  })
})

describe('slugify', () => {
  it('slugifies titles', () => {
    expect(slugify('My Demo App')).toBe('my-demo-app')
    expect(slugify('Caffè & Co.')).toBe('caffe-co')
  })

  it('falls back for empty results', () => {
    expect(slugify('***')).toBe('claude-artifact')
  })
})

describe('splitInlineAssets', () => {
  it('extracts inline styles and executable scripts only', () => {
    const { html, assets } = splitInlineAssets(SAMPLE)
    expect(assets.map((a) => a.path)).toEqual([
      'css/style-1.css',
      'js/script-2.js',
      'js/script-3.js',
    ])
    expect(assets[0].content).toContain('color: red')
    expect(html).toContain('<link rel="stylesheet" href="css/style-1.css">')
    expect(html).toContain('<script src="js/script-2.js">')
    expect(html).toContain('<script type="module" src="js/script-3.js">')
    // Data blocks and external scripts stay untouched.
    expect(html).toContain('{"data": 1}')
    expect(html).toContain('https://example.com/lib.js')
  })
})

describe('buildProject', () => {
  it('keeps the document intact by default', () => {
    const project = buildProject(SAMPLE, { sourceUrl: 'https://claude.ai/code/artifact/x' })
    expect(project.name).toBe('my-demo-app')
    expect(project.files.map((f) => f.path)).toEqual(['index.html', 'README.md'])
    expect(project.files[0].content).toBe(SAMPLE)
  })

  it('adds split assets when requested', () => {
    const project = buildProject(SAMPLE, { splitAssets: true })
    expect(project.files.map((f) => f.path)).toEqual([
      'index.html',
      'css/style-1.css',
      'js/script-2.js',
      'js/script-3.js',
      'README.md',
    ])
  })

  it('records metadata in the README', () => {
    const generatedAt = new Date('2026-08-22T10:00:00Z')
    const project = buildProject(SAMPLE, {
      sourceUrl: 'https://claude.ai/code/artifact/abc',
      generatedAt,
    })
    const readme = project.files.at(-1)!
    expect(readme.content).toContain('# My Demo App')
    expect(readme.content).toContain('https://claude.ai/code/artifact/abc')
    expect(readme.content).toContain('2026-08-22T10:00:00.000Z')
    expect(readme.content).toContain('- `index.html`')
  })
})

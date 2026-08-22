import { describe, expect, it } from 'vitest'
import { buildProject, extractTitle, slugify } from './htmlProject'

const SAMPLE = `<!doctype html><html><head><title>My Demo App</title>
<style>body { color: red; }</style>
</head><body>
<h1>Hello</h1>
<script>console.log('hi')</script>
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

describe('buildProject', () => {
  it('keeps the document intact and names the project after the title', () => {
    const project = buildProject(SAMPLE, { sourceUrl: 'https://claude.ai/code/artifact/x' })
    expect(project.name).toBe('my-demo-app')
    expect(project.files.map((f) => f.path)).toEqual(['index.html', 'README.md'])
    expect(project.files[0].content).toBe(SAMPLE)
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

  it('handles a document without a title', () => {
    const project = buildProject('<html><body>x</body></html>')
    expect(project.name).toBe('claude-artifact')
    expect(project.files.at(-1)!.content).toContain('# Claude artifact')
  })
})

import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { zipProject } from './zip'

describe('zipProject', () => {
  it('produces a zip containing every project file', async () => {
    const blob = await zipProject({
      name: 'demo',
      files: [
        { path: 'index.html', content: '<h1>hi</h1>' },
        { path: 'css/style-1.css', content: 'body{}' },
      ],
    })

    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    expect(Object.keys(zip.files).filter((k) => !zip.files[k].dir).sort()).toEqual([
      'css/style-1.css',
      'index.html',
    ])
    expect(await zip.file('index.html')!.async('string')).toBe('<h1>hi</h1>')
  })
})

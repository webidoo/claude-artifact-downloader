import { describe, expect, it } from 'vitest'
import { findArtifactFrameSrc, waitForArtifactFrameSrc } from './frame'

const FRAME_SRC =
  'https://bfdfaef9-bc62-4dfe-ba9e-c58a26c9accf.frame.claudeusercontent.com/_f/3/?__frame_t=token'

function docWith(body: string): Document {
  return new DOMParser().parseFromString(`<html><body>${body}</body></html>`, 'text/html')
}

describe('findArtifactFrameSrc', () => {
  it('finds the content frame', () => {
    const doc = docWith(`<iframe src="${FRAME_SRC}"></iframe>`)
    expect(findArtifactFrameSrc(doc)).toBe(FRAME_SRC)
  })

  it('ignores unrelated iframes', () => {
    const doc = docWith(`
      <iframe></iframe>
      <iframe src="about:blank"></iframe>
      <iframe src="https://challenges.cloudflare.com/x"></iframe>
    `)
    expect(findArtifactFrameSrc(doc)).toBeNull()
  })

  it('rejects lookalike hosts', () => {
    const doc = docWith(
      '<iframe src="https://evil.example/x.frame.claudeusercontent.com"></iframe>',
    )
    expect(findArtifactFrameSrc(doc)).toBeNull()
  })
})

describe('waitForArtifactFrameSrc', () => {
  it('resolves once the frame appears', async () => {
    const doc = docWith('')
    setTimeout(() => {
      const iframe = doc.createElement('iframe')
      iframe.setAttribute('src', FRAME_SRC)
      doc.body.appendChild(iframe)
    }, 20)
    await expect(waitForArtifactFrameSrc(doc, 1000, 10)).resolves.toBe(FRAME_SRC)
  })

  it('rejects on timeout', async () => {
    await expect(waitForArtifactFrameSrc(docWith(''), 30, 10)).rejects.toThrow(
      /frame not found/i,
    )
  })
})

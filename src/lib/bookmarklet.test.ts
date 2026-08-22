import { describe, expect, it } from 'vitest'
import { buildBookmarkletHref } from './bookmarklet'

describe('buildBookmarkletHref', () => {
  it('produces a single-line javascript: URL', () => {
    const href = buildBookmarkletHref()
    expect(href.startsWith('javascript:')).toBe(true)
    expect(href).not.toContain('\n')
    expect(href).not.toContain('%0A')
  })

  it('contains the logic for both page contexts', () => {
    const source = decodeURIComponent(buildBookmarkletHref().slice('javascript:'.length))
    expect(source).toContain('frame.claudeusercontent.com')
    expect(source).toContain("h==='claude.ai'")
    expect(source).toContain('window.open')
    expect(source).toContain('a.download')
  })
})

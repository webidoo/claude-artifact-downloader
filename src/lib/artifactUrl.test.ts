import { describe, expect, it } from 'vitest'
import { parseArtifactUrl } from './artifactUrl'

const UUID = 'bfdfaef9-bc62-4dfe-ba9e-c58a26c9accf'
const ORG = '9b3ada51-874b-4e17-806a-cd2d49a66d4c'

describe('parseArtifactUrl', () => {
  it('parses a full artifact URL with org', () => {
    const ref = parseArtifactUrl(`https://claude.ai/code/artifact/${UUID}?org=${ORG}`)
    expect(ref).toEqual({
      uuid: UUID,
      org: ORG,
      pageUrl: `https://claude.ai/code/artifact/${UUID}?org=${ORG}`,
    })
  })

  it('parses an artifact URL without org', () => {
    const ref = parseArtifactUrl(`https://claude.ai/code/artifact/${UUID}`)
    expect(ref?.uuid).toBe(UUID)
    expect(ref?.org).toBeNull()
  })

  it('parses a vanity-slug URL', () => {
    const ref = parseArtifactUrl(`https://claude.ai/code/artifact/my-dashboard-${UUID}`)
    expect(ref?.uuid).toBe(UUID)
  })

  it('parses a shared /code/frame/ URL, preserving the path variant', () => {
    const ref = parseArtifactUrl(`https://claude.ai/code/frame/${UUID}`)
    expect(ref?.uuid).toBe(UUID)
    expect(ref?.pageUrl).toBe(`https://claude.ai/code/frame/${UUID}`)
  })

  it('parses a bare UUID and normalizes case', () => {
    const ref = parseArtifactUrl(`  ${UUID.toUpperCase()} `)
    expect(ref?.uuid).toBe(UUID)
    expect(ref?.pageUrl).toBe(`https://claude.ai/code/artifact/${UUID}`)
  })

  it('ignores an invalid org param', () => {
    const ref = parseArtifactUrl(`https://claude.ai/code/artifact/${UUID}?org=not-a-uuid`)
    expect(ref?.org).toBeNull()
  })

  it('rejects other hosts', () => {
    expect(parseArtifactUrl(`https://example.com/code/artifact/${UUID}`)).toBeNull()
  })

  it('rejects other claude.ai paths', () => {
    expect(parseArtifactUrl(`https://claude.ai/chat/${UUID}`)).toBeNull()
    expect(parseArtifactUrl('https://claude.ai/code/artifact/')).toBeNull()
    expect(parseArtifactUrl(`https://claude.ai/code/other/${UUID}`)).toBeNull()
  })

  it('rejects a slug not separated from the UUID by a dash', () => {
    expect(parseArtifactUrl(`https://claude.ai/code/artifact/abc${UUID}`)).toBeNull()
  })

  it('rejects garbage input', () => {
    expect(parseArtifactUrl('')).toBeNull()
    expect(parseArtifactUrl('hello world')).toBeNull()
  })
})

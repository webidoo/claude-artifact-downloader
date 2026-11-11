/**
 * Parsing of claude.ai artifact URLs. Pure functions only.
 */

export interface ArtifactRef {
  /** Artifact UUID, lowercase. */
  uuid: string
  /** Organization UUID from the `?org=` query param, if present. */
  org: string | null
  /** Artifact page URL on claude.ai, preserving the path variant it came from. */
  pageUrl: string
}

/**
 * Path variants claude.ai serves artifacts under: `/code/artifact/…` for
 * one's own artifacts, `/code/frame/…` for artifacts shared by others, and
 * the top-level `/artifact/…` / `/frame/…` forms used by public share links.
 */
const PATH_KINDS = ['artifact', 'frame'] as const
type PathKind = (typeof PATH_KINDS)[number]

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
const UUID_ONLY_RE = new RegExp(`^${UUID}$`, 'i')
const TRAILING_UUID_RE = new RegExp(`${UUID}$`, 'i')

function toRef(uuid: string, org: string | null, kind: PathKind): ArtifactRef {
  const id = uuid.toLowerCase()
  const query = org ? `?org=${org.toLowerCase()}` : ''
  return {
    uuid: id,
    org: org ? org.toLowerCase() : null,
    pageUrl: `https://claude.ai/code/${kind}/${id}${query}`,
  }
}

/**
 * Parses user input into an artifact reference.
 *
 * Accepted forms:
 * - `https://claude.ai/code/artifact/<id>[?org=<uuid>]`
 * - `https://claude.ai/code/frame/<id>[?org=<uuid>]`
 * - `https://claude.ai/artifact/<id>` / `https://claude.ai/frame/<id>` (public share links)
 * - any of the above with a `<vanity-slug>-` prefix before a standard UUID
 * - a bare artifact UUID
 *
 * `<id>` may be a standard UUID or claude.ai's shorter shared-artifact id
 * (which is not a UUID and is accepted verbatim).
 *
 * Returns `null` for anything else.
 */
export function parseArtifactUrl(input: string): ArtifactRef | null {
  const trimmed = input.trim()
  if (trimmed === '') return null

  if (UUID_ONLY_RE.test(trimmed)) {
    return toRef(trimmed, null, 'artifact')
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }
  if (url.hostname !== 'claude.ai') return null

  const segments = url.pathname.split('/').filter(Boolean)

  // `/code/artifact/<id>` / `/code/frame/<id>` (3 segments, `code` prefix) or
  // `/artifact/<id>` / `/frame/<id>` (2 segments, top-level share link).
  let kind: PathKind | undefined
  let idSeg: string | undefined
  if (segments.length === 3 && segments[0] === 'code') {
    kind = PATH_KINDS.find((k) => k === segments[1])
    idSeg = segments[2]
  } else if (segments.length === 2) {
    kind = PATH_KINDS.find((k) => k === segments[0])
    idSeg = segments[1]
  }
  if (!kind || !idSeg) return null

  // The id may be a bare id or a `<slug>-<uuid>` vanity form. A trailing
  // standard UUID (case-insensitive) wins; otherwise the whole segment is
  // accepted verbatim so claude.ai's non-UUID shared ids work too.
  const uuidMatch = idSeg.match(TRAILING_UUID_RE)
  let id: string
  if (uuidMatch) {
    const prefix = idSeg.slice(0, -uuidMatch[0].length)
    if (prefix !== '' && !prefix.endsWith('-')) return null
    id = uuidMatch[0]
  } else {
    id = idSeg
  }

  const orgParam = url.searchParams.get('org')
  const org = orgParam && UUID_ONLY_RE.test(orgParam) ? orgParam : null
  return toRef(id, org, kind)
}

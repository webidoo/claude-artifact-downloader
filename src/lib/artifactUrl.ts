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
 * one's own artifacts, `/code/frame/…` for artifacts shared by others.
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
 * - `https://claude.ai/code/artifact/<uuid>[?org=<uuid>]`
 * - `https://claude.ai/code/frame/<uuid>[?org=<uuid>]`
 * - either of the above with a `<vanity-slug>-` prefix before the UUID
 * - a bare artifact UUID
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
  const kind = PATH_KINDS.find((k) => k === segments[1])
  if (segments.length !== 3 || segments[0] !== 'code' || !kind) {
    return null
  }

  const uuidMatch = segments[2].match(TRAILING_UUID_RE)
  if (!uuidMatch) return null
  // A vanity slug, when present, is separated from the UUID by a dash.
  const prefix = segments[2].slice(0, -uuidMatch[0].length)
  if (prefix !== '' && !prefix.endsWith('-')) return null

  const orgParam = url.searchParams.get('org')
  const org = orgParam && UUID_ONLY_RE.test(orgParam) ? orgParam : null
  return toRef(uuidMatch[0], org, kind)
}

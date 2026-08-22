/**
 * Locating the artifact content frame on a claude.ai artifact page.
 * The page renders the artifact inside an iframe hosted on
 * `<uuid>.frame.claudeusercontent.com`; its `src` carries the per-session
 * asset token, so reusing it is the simplest reliable way to fetch the
 * artifact HTML.
 */

const FRAME_HOST_RE = /^[0-9a-f-]+\.frame\.claudeusercontent\.com$/i

/** Returns the content frame URL on an artifact page, or null if absent. */
export function findArtifactFrameSrc(doc: Document): string | null {
  for (const iframe of doc.querySelectorAll('iframe[src]')) {
    const src = iframe.getAttribute('src')
    if (!src) continue
    try {
      if (FRAME_HOST_RE.test(new URL(src, doc.baseURI).hostname)) return src
    } catch {
      // Ignore unparsable src values (e.g. about:blank helpers).
    }
  }
  return null
}

/** Polls for the content frame until it appears or the timeout elapses. */
export function waitForArtifactFrameSrc(
  doc: Document,
  timeoutMs: number,
  intervalMs = 300,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now()
    const tick = () => {
      const src = findArtifactFrameSrc(doc)
      if (src) {
        resolve(src)
      } else if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error('Artifact frame not found. Is the artifact still loading?'))
      } else {
        setTimeout(tick, intervalMs)
      }
    }
    tick()
  })
}

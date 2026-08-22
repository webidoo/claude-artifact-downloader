import { FETCH_ARTIFACT_HTML } from './messages'
import type { FetchArtifactHtmlRequest, FetchArtifactHtmlResponse } from './messages'

const FRAME_HOST_RE = /^[0-9a-f-]+\.frame\.claudeusercontent\.com$/i

/**
 * The content script cannot read the artifact frame cross-origin (CORS), so
 * it asks this service worker, whose host_permissions exempt the fetch.
 */
chrome.runtime.onMessage.addListener(
  (
    message: FetchArtifactHtmlRequest,
    _sender,
    sendResponse: (response: FetchArtifactHtmlResponse) => void,
  ) => {
    if (message?.type !== FETCH_ARTIFACT_HTML || typeof message.url !== 'string') {
      return
    }

    let hostname: string
    try {
      hostname = new URL(message.url).hostname
    } catch {
      sendResponse({ ok: false, error: 'Invalid frame URL.' })
      return
    }
    if (!FRAME_HOST_RE.test(hostname)) {
      sendResponse({ ok: false, error: `Unexpected frame host: ${hostname}` })
      return
    }

    fetch(message.url, { credentials: 'omit' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        sendResponse({ ok: true, html: await response.text() })
      })
      .catch((error: unknown) => {
        sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) })
      })

    // Keep the message channel open for the async sendResponse above.
    return true
  },
)

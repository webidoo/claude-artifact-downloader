import { FETCH_ARTIFACT_HTML, FRAME_GET_HTML } from './messages'
import type { FetchArtifactHtmlRequest, FetchArtifactHtmlResponse } from './messages'

/**
 * Content scripts cannot message each other directly, so this service worker
 * relays the artifact-page script's request to the script running inside the
 * artifact content frame (which captures the HTML same-origin).
 */
chrome.runtime.onMessage.addListener(
  (
    message: FetchArtifactHtmlRequest,
    sender,
    sendResponse: (response: FetchArtifactHtmlResponse) => void,
  ) => {
    if (message?.type !== FETCH_ARTIFACT_HTML) return

    const tabId = sender.tab?.id
    if (tabId === undefined) {
      sendResponse({ ok: false, error: 'Request did not come from a tab.' })
      return
    }

    // Delivered to every frame in the tab; only the artifact frame's script
    // answers this message type.
    chrome.tabs
      .sendMessage(tabId, { type: FRAME_GET_HTML })
      .then((response: FetchArtifactHtmlResponse | undefined) => {
        sendResponse(response ?? { ok: false, error: 'The artifact frame did not respond.' })
      })
      .catch(() => {
        sendResponse({ ok: false, error: 'Artifact frame not reachable yet.' })
      })

    // Keep the message channel open for the async sendResponse above.
    return true
  },
)

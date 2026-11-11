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
    void handleFetchArtifactHtml(message, sender, sendResponse)
    // Keep the message channel open for the async sendResponse above.
    return true
  },
)

async function handleFetchArtifactHtml(
  message: FetchArtifactHtmlRequest,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: FetchArtifactHtmlResponse) => void,
): Promise<void> {
  const tabId = sender.tab?.id
  if (tabId === undefined) {
    sendResponse({ ok: false, error: 'Request did not come from a tab.' })
    return
  }

  // Preferred path: fetch the artifact frame directly from the service worker.
  // This works even when the frame is sandboxed (Chrome does not inject content
  // scripts into sandboxed iframes), as long as the extension holds host
  // permission for the frame origin and the user's session cookie is present.
  if (message.frameSrc) {
    try {
      const resp = await fetch(message.frameSrc, { credentials: 'include' })
      if (resp.ok) {
        const html = await resp.text()
        sendResponse({ ok: true, html })
        return
      }
    } catch {
      // Fall through to the frame-relay path below.
    }
  }

  // Fallback: relay to the content script running inside the artifact frame.
  chrome.tabs
    .sendMessage(tabId, { type: FRAME_GET_HTML })
    .then((response: FetchArtifactHtmlResponse | undefined) => {
      sendResponse(response ?? { ok: false, error: 'The artifact frame did not respond.' })
    })
    .catch(() => {
      sendResponse({ ok: false, error: 'Artifact frame not reachable yet.' })
    })
}

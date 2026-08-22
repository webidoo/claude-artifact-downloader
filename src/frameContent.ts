import { FRAME_GET_HTML } from './messages'
import type { FrameGetHtmlRequest, FrameGetHtmlResponse } from './messages'

/**
 * Runs inside the artifact content frame (`<uuid>.frame.claudeusercontent.com`),
 * the only context that can read the artifact same-origin — no CORS, no
 * reuse of the frame's per-session asset token.
 */

async function captureHtml(): Promise<string> {
  try {
    // Re-request the document to get the pristine served HTML rather than the
    // current DOM, which the artifact's own scripts may have mutated.
    const response = await fetch(location.href, { credentials: 'include' })
    if (response.ok) return await response.text()
  } catch {
    // Fall through to DOM serialization.
  }
  return '<!doctype html>\n' + document.documentElement.outerHTML
}

chrome.runtime.onMessage.addListener(
  (message: FrameGetHtmlRequest, _sender, sendResponse: (r: FrameGetHtmlResponse) => void) => {
    if (message?.type !== FRAME_GET_HTML) return
    captureHtml()
      .then((html) => sendResponse({ ok: true, html }))
      .catch((error: unknown) => {
        sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) })
      })
    // Keep the message channel open for the async sendResponse above.
    return true
  },
)

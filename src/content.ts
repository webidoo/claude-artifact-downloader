import { parseArtifactUrl } from './lib/artifactUrl'
import { buildProject } from './lib/htmlProject'
import { saveBlob } from './lib/download'
import { zipProject } from './lib/zip'
import { waitForArtifactFrameSrc } from './frame'
import { FETCH_ARTIFACT_HTML, TRIGGER_DOWNLOAD } from './messages'
import type {
  FetchArtifactHtmlResponse,
  TriggerDownloadRequest,
  TriggerDownloadResponse,
} from './messages'

const BUTTON_ID = 'claude-artifact-downloader-button'
const FRAME_TIMEOUT_MS = 15_000

async function fetchArtifactHtml(): Promise<string> {
  const frameSrc = await waitForArtifactFrameSrc(document, FRAME_TIMEOUT_MS)
  const response = (await chrome.runtime.sendMessage({
    type: FETCH_ARTIFACT_HTML,
    url: frameSrc,
  })) as FetchArtifactHtmlResponse | undefined
  if (!response) throw new Error('No response from the extension service worker.')
  if (!response.ok) throw new Error(response.error)
  return response.html
}

async function downloadArtifactZip(): Promise<string> {
  const html = await fetchArtifactHtml()
  const ref = parseArtifactUrl(location.href)
  const project = buildProject(html, {
    sourceUrl: ref?.pageUrl ?? location.href,
    generatedAt: new Date(),
  })
  saveBlob(await zipProject(project), `${project.name}.zip`)
  return project.name
}

let busy = false

/** Runs one download, reflecting progress on the page button. */
async function runDownload(button: HTMLButtonElement): Promise<void> {
  if (busy) return
  busy = true
  button.textContent = 'Preparing…'
  try {
    const name = await downloadArtifactZip()
    button.textContent = `Saved ${name}.zip ✓`
  } catch (error) {
    console.error('[claude-artifact-downloader]', error)
    button.textContent = 'Failed — click to retry'
    throw error
  } finally {
    busy = false
    setTimeout(() => {
      button.textContent = '⬇ Download zip'
    }, 4000)
  }
}

function injectButton(): HTMLButtonElement {
  const existing = document.getElementById(BUTTON_ID)
  if (existing) return existing as HTMLButtonElement

  const button = document.createElement('button')
  button.id = BUTTON_ID
  button.type = 'button'
  button.textContent = '⬇ Download zip'
  // Inline styles so the page's stylesheets cannot affect the button.
  button.style.cssText = [
    'position:fixed',
    'right:16px',
    'bottom:16px',
    'z-index:2147483647',
    'padding:10px 16px',
    'border:none',
    'border-radius:10px',
    'background:#c6613f',
    'color:#fff',
    'font:600 14px/1 system-ui,sans-serif',
    'cursor:pointer',
    'box-shadow:0 2px 8px rgba(0,0,0,.25)',
  ].join(';')

  button.addEventListener('click', () => {
    runDownload(button).catch(() => {})
  })

  document.body.appendChild(button)
  return button
}

const button = injectButton()

// The popup triggers the same flow for people who reach for the toolbar icon.
chrome.runtime.onMessage.addListener(
  (
    message: TriggerDownloadRequest,
    _sender,
    sendResponse: (response: TriggerDownloadResponse) => void,
  ) => {
    if (message?.type !== TRIGGER_DOWNLOAD) return
    runDownload(button)
      .then(() => sendResponse({ ok: true }))
      .catch((error: unknown) => {
        sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) })
      })
    // Keep the message channel open for the async sendResponse above.
    return true
  },
)

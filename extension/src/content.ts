import { parseArtifactUrl } from '../../src/lib/artifactUrl'
import { buildProject } from '../../src/lib/htmlProject'
import { saveBlob } from '../../src/lib/download'
import { zipProject } from '../../src/lib/zip'
import { waitForArtifactFrameSrc } from './frame'
import { FETCH_ARTIFACT_HTML } from './messages'
import type { FetchArtifactHtmlResponse } from './messages'

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

function injectButton(): void {
  if (document.getElementById(BUTTON_ID)) return

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

  let busy = false
  button.addEventListener('click', () => {
    if (busy) return
    busy = true
    button.textContent = 'Preparing…'
    downloadArtifactZip()
      .then((name) => {
        button.textContent = `Saved ${name}.zip ✓`
      })
      .catch((error: unknown) => {
        console.error('[claude-artifact-downloader]', error)
        button.textContent = 'Failed — click to retry'
      })
      .finally(() => {
        busy = false
        setTimeout(() => {
          button.textContent = '⬇ Download zip'
        }, 4000)
      })
  })

  document.body.appendChild(button)
}

injectButton()

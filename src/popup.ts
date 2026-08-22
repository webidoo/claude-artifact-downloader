import { parseArtifactUrl } from './lib/artifactUrl'
import { TRIGGER_DOWNLOAD } from './messages'
import type { TriggerDownloadResponse } from './messages'

const ARTIFACTS_GALLERY_URL = 'https://claude.ai/code/artifacts'

function show(id: 'on-artifact' | 'elsewhere'): void {
  document.getElementById('on-artifact')!.hidden = id !== 'on-artifact'
  document.getElementById('elsewhere')!.hidden = id !== 'elsewhere'
}

function setStatus(text: string): void {
  document.getElementById('status')!.textContent = text
}

async function triggerDownload(tabId: number): Promise<void> {
  setStatus('Downloading… (can take a few seconds)')
  let response: TriggerDownloadResponse | undefined
  try {
    response = (await chrome.tabs.sendMessage(tabId, {
      type: TRIGGER_DOWNLOAD,
    })) as TriggerDownloadResponse | undefined
  } catch {
    // sendMessage rejects when no content script is listening — typical for a
    // tab that was already open when the extension was installed or updated.
    setStatus('The extension is not loaded in this tab. Reload the tab, then try again.')
    return
  }
  if (response?.ok) {
    window.close()
    return
  }
  // Surface the page's actual error so failures are diagnosable.
  setStatus(response?.error ?? 'The page did not respond. Reload the tab, then try again.')
}

async function main(): Promise<void> {
  document.getElementById('version')!.textContent = `v${chrome.runtime.getManifest().version}`
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const artifact = tab?.url ? parseArtifactUrl(tab.url) : null

  if (!artifact || tab?.id === undefined) {
    show('elsewhere')
    document.getElementById('open-gallery')!.addEventListener('click', () => {
      void chrome.tabs.create({ url: ARTIFACTS_GALLERY_URL })
      window.close()
    })
    return
  }

  show('on-artifact')
  const tabId = tab.id
  document.getElementById('download')!.addEventListener('click', () => {
    void triggerDownload(tabId)
  })
}

void main()

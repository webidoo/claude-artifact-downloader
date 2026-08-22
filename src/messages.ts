/** Message contracts between content script, service worker, and popup. */

export const FETCH_ARTIFACT_HTML = 'FETCH_ARTIFACT_HTML'

export interface FetchArtifactHtmlRequest {
  type: typeof FETCH_ARTIFACT_HTML
  url: string
}

export type FetchArtifactHtmlResponse =
  | { ok: true; html: string }
  | { ok: false; error: string }

/** Sent by the popup to the content script of the active artifact tab. */
export const TRIGGER_DOWNLOAD = 'TRIGGER_DOWNLOAD'

export interface TriggerDownloadRequest {
  type: typeof TRIGGER_DOWNLOAD
}

export type TriggerDownloadResponse = { ok: true } | { ok: false; error: string }

/** Message contracts between content scripts, service worker, and popup. */

/** Sent by the artifact-page content script to the service worker. */
export const FETCH_ARTIFACT_HTML = 'FETCH_ARTIFACT_HTML'

export interface FetchArtifactHtmlRequest {
  type: typeof FETCH_ARTIFACT_HTML
  /** The artifact frame's URL, when discovered on the page. Lets the service
   *  worker fetch it directly (works even for sandboxed frames). */
  frameSrc?: string
}

export type FetchArtifactHtmlResponse =
  | { ok: true; html: string }
  | { ok: false; error: string }

/** Relayed by the service worker to the content script inside the artifact frame. */
export const FRAME_GET_HTML = 'FRAME_GET_HTML'

export interface FrameGetHtmlRequest {
  type: typeof FRAME_GET_HTML
}

export type FrameGetHtmlResponse = FetchArtifactHtmlResponse

/** Sent by the popup to the content script of the active artifact tab. */
export const TRIGGER_DOWNLOAD = 'TRIGGER_DOWNLOAD'

export interface TriggerDownloadRequest {
  type: typeof TRIGGER_DOWNLOAD
}

export type TriggerDownloadResponse = { ok: true } | { ok: false; error: string }

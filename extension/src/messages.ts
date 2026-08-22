/** Message contract between the content script and the service worker. */

export const FETCH_ARTIFACT_HTML = 'FETCH_ARTIFACT_HTML'

export interface FetchArtifactHtmlRequest {
  type: typeof FETCH_ARTIFACT_HTML
  url: string
}

export type FetchArtifactHtmlResponse =
  | { ok: true; html: string }
  | { ok: false; error: string }

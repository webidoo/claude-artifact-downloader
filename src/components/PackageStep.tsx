import { useMemo, useState } from 'react'
import { buildProject } from '../lib/htmlProject'
import { saveBlob } from '../lib/download'
import { zipProject } from '../lib/zip'
import type { ArtifactRef } from '../lib/artifactUrl'

export interface CapturedHtml {
  html: string
  fileName: string | null
}

interface Props {
  artifact: ArtifactRef
  captured: CapturedHtml | null
  onCaptured: (captured: CapturedHtml) => void
}

export function PackageStep({ artifact, captured, onCaptured }: Props) {
  const [splitAssets, setSplitAssets] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const project = useMemo(
    () =>
      captured
        ? buildProject(captured.html, {
            sourceUrl: artifact.pageUrl,
            splitAssets,
            generatedAt: new Date(),
          })
        : null,
    [captured, artifact, splitAssets],
  )

  async function readFile(file: File) {
    setError(null)
    onCaptured({ html: await file.text(), fileName: file.name })
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) void readFile(file)
  }

  async function handleDownload() {
    if (!project) return
    setBusy(true)
    setError(null)
    try {
      saveBlob(await zipProject(project), `${project.name}.zip`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card">
      <h2>
        <span className="step-number">3</span> Package it as a zip
      </h2>

      <label
        className={`dropzone${dragging ? ' dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".html,.htm,text/html"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void readFile(file)
          }}
        />
        {captured
          ? `Loaded ${captured.fileName ?? 'pasted HTML'} (${captured.html.length.toLocaleString()} characters)`
          : 'Drop the downloaded .html file here, or click to choose it'}
      </label>

      <details>
        <summary>…or paste the HTML source instead</summary>
        <textarea
          rows={6}
          placeholder="<!doctype html>…"
          spellCheck={false}
          onChange={(e) => {
            const html = e.target.value.trim()
            if (html) onCaptured({ html, fileName: null })
          }}
        />
      </details>

      <label className="option">
        <input
          type="checkbox"
          checked={splitAssets}
          onChange={(e) => setSplitAssets(e.target.checked)}
        />
        Extract inline CSS/JS into <code>css/</code> and <code>js/</code> files
      </label>

      {project && (
        <p className="hint">
          Zip contents: {project.files.map((f) => f.path).join(', ')}
        </p>
      )}
      {error && <p className="error">{error}</p>}

      <button
        type="button"
        className="primary"
        disabled={!project || busy}
        onClick={() => void handleDownload()}
      >
        {busy ? 'Packaging…' : project ? `Download ${project.name}.zip` : 'Download zip'}
      </button>
    </section>
  )
}

import { useState } from 'react'
import { parseArtifactUrl } from '../lib/artifactUrl'
import type { ArtifactRef } from '../lib/artifactUrl'

interface Props {
  onParsed: (ref: ArtifactRef) => void
}

export function UrlStep({ onParsed }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ArtifactRef | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const ref = parseArtifactUrl(value)
    if (!ref) {
      setParsed(null)
      setError(
        'Not a recognized artifact URL. Expected https://claude.ai/code/artifact/<id> or a bare artifact id.',
      )
      return
    }
    setError(null)
    setParsed(ref)
    onParsed(ref)
  }

  return (
    <section className="card">
      <h2>
        <span className="step-number">1</span> Paste the artifact URL
      </h2>
      <form onSubmit={handleSubmit} className="url-form">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://claude.ai/code/artifact/…"
          aria-label="Artifact URL"
          spellCheck={false}
        />
        <button type="submit">Continue</button>
      </form>
      {error && <p className="error">{error}</p>}
      {parsed && (
        <p className="hint">
          Artifact <code>{parsed.uuid}</code>
          {parsed.org && (
            <>
              {' '}
              · org <code>{parsed.org}</code>
            </>
          )}
        </p>
      )}
    </section>
  )
}

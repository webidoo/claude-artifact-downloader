import { useState } from 'react'
import { CaptureStep } from './components/CaptureStep'
import { PackageStep } from './components/PackageStep'
import { UrlStep } from './components/UrlStep'
import type { ArtifactRef } from './lib/artifactUrl'
import type { CapturedHtml } from './components/PackageStep'

export default function App() {
  const [artifact, setArtifact] = useState<ArtifactRef | null>(null)
  const [captured, setCaptured] = useState<CapturedHtml | null>(null)

  return (
    <main className="app">
      <header>
        <h1>Claude Artifact Downloader</h1>
        <p className="tagline">
          Turn a claude.ai artifact into a project zip you can keep, share, or host.
        </p>
      </header>

      <UrlStep
        onParsed={(ref) => {
          setArtifact(ref)
          setCaptured(null)
        }}
      />

      {artifact && <CaptureStep artifact={artifact} />}

      {artifact && (
        <PackageStep artifact={artifact} captured={captured} onCaptured={setCaptured} />
      )}

      <footer>
        <p>
          Open source under the MIT license. Artifact content stays in your browser — nothing is
          uploaded anywhere.
        </p>
      </footer>
    </main>
  )
}

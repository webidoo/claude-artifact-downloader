import { buildBookmarkletHref } from '../lib/bookmarklet'
import type { ArtifactRef } from '../lib/artifactUrl'

interface Props {
  artifact: ArtifactRef
}

/**
 * Guides the user through capturing the artifact HTML with the bookmarklet.
 * The capture must happen in the user's own claude.ai tab because artifact
 * content sits behind the claude.ai session (CORS blocks us here).
 */
export function CaptureStep({ artifact }: Props) {
  return (
    <section className="card">
      <h2>
        <span className="step-number">2</span> Capture the artifact
      </h2>
      <p>
        Artifact content is only readable from your own claude.ai session, so this app hands the
        capture to a small bookmarklet running in your browser:
      </p>
      <ol className="instructions">
        <li>
          Drag this button to your bookmarks bar (one-time setup):{' '}
          <a
            className="bookmarklet"
            // React blocks `javascript:` hrefs set via JSX, so the attribute
            // is applied directly on the DOM node.
            ref={(node) => {
              node?.setAttribute('href', buildBookmarkletHref())
            }}
            onClick={(e) => e.preventDefault()}
            title="Drag me to your bookmarks bar"
          >
            ⬇ Save Claude Artifact
          </a>
        </li>
        <li>
          <a href={artifact.pageUrl} target="_blank" rel="noreferrer">
            Open the artifact page
          </a>{' '}
          and wait for it to load, then click the bookmarklet — the artifact content opens in a
          new tab.
        </li>
        <li>
          On that new tab, click the bookmarklet again — an <code>.html</code> file is saved to
          your downloads.
        </li>
      </ol>
    </section>
  )
}

# Claude Artifact Downloader

[![CI](https://github.com/webidoo/claude-artifact-downloader/actions/workflows/ci.yml/badge.svg)](https://github.com/webidoo/claude-artifact-downloader/actions/workflows/ci.yml)

A browser extension (Manifest V3) that downloads the [claude.ai](https://claude.ai)
artifact you are viewing as a ready-to-use project zip — `index.html` plus a generated
README with the source URL and download date.

Everything runs locally in your browser; artifact content is never sent anywhere.

## Install

```bash
npm install
npm run build
```

Then in Chrome/Edge/Brave: `chrome://extensions` → enable *Developer mode* →
*Load unpacked* → select the `dist/` folder.

## Usage

Open any `https://claude.ai/code/artifact/…` page. You can download from either place:

- the **⬇ Download zip** button injected in the page's bottom-right corner, or
- the extension's toolbar icon, whose popup shows a download button when you are on an
  artifact page (and short instructions when you are not).

Tabs that were already open when the extension was installed or updated need one reload
before the button appears.

## Why an extension?

A claude.ai artifact page is only a shell. The actual content is fetched by that page
from claude.ai's authenticated, same-origin API (`/api/frame/<uuid>`) and rendered
inside an iframe hosted on `<uuid>.frame.claudeusercontent.com`, guarded by a
per-session asset token. No external website or server can read it:

- **CORS**: claude.ai does not allow cross-origin reads of those endpoints.
- **Authentication**: the API requires your claude.ai session cookies, which are never
  sent (or readable) cross-origin.
- **Sandboxing**: the content frame itself blocks page-initiated downloads, which rules
  out bookmarklet-style tricks.
- **Bot protection**: server-side proxies get challenged by Cloudflare.

The only context with enough privileges is an extension running in your own browser —
the same conclusion reached by
[claude-artifacts-downloader](https://github.com/ashwanthkumar/claude-artifacts-downloader),
which inspired this project.

## How it works

1. A content script on artifact pages injects the download button and waits for the
   artifact's content iframe (`src/frame.ts`).
2. A second content script runs *inside* that iframe (`src/frameContent.ts`) — the only
   context that can read the artifact same-origin, with no CORS and no reuse of the
   frame's per-session asset token. It re-fetches the document to get the pristine
   served HTML (falling back to DOM serialization).
3. The service worker (`src/background.ts`) merely relays messages between the two —
   content scripts cannot talk to each other directly.
4. The HTML is packaged by pure, unit-tested functions (`src/lib/`) and the zip download
   is triggered from the artifact page.

## Development

```bash
npm run build      # typecheck + bundle to dist/
npm test           # unit tests (Vitest)
npm run typecheck  # TypeScript only, no emit
```

After changing code, rebuild and hit the reload icon on `chrome://extensions`.

## Project structure

```
manifest.json            # MV3 manifest (copied verbatim into dist/)
icons/                   # toolbar/store icons (regenerate: node scripts/make-icons.mjs)
scripts/build.mjs        # esbuild bundling
src/
├── content.ts           # button UI + orchestration on artifact pages
├── frameContent.ts      # runs inside the artifact frame: same-origin HTML capture
├── background.ts        # service worker: relays messages between content scripts
├── popup.html / popup.ts# toolbar popup: download trigger + usage hints
├── frame.ts             # locate the content iframe (pure, tested)
├── messages.ts          # typed message contracts between the parts
└── lib/                 # pure core (all tested)
    ├── artifactUrl.ts   # parse claude.ai artifact URLs → {uuid, org, pageUrl}
    ├── htmlProject.ts   # captured HTML → project file list (title, README)
    ├── zip.ts           # project file list → zip blob (JSZip)
    └── download.ts      # trigger a browser download (only DOM side effect)
```

## Limitations

- Depends on claude.ai's current page structure (the content iframe on
  `*.frame.claudeusercontent.com`). If claude.ai changes it, `src/frame.ts` may need an
  update.
- Artifacts are captured as the single HTML document claude.ai serves. Remote assets
  referenced by the artifact (fonts, images on other hosts) are not bundled.
- Targets Chromium browsers (Chrome, Edge, Brave…). Firefox needs a slightly different
  manifest (`background.scripts`); Safari needs a converted build.
- You need access to the artifact in your own browser (logged in, or a link shared with
  you).

## License

[MIT](LICENSE) © 2026 Webidoo

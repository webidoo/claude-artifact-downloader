# Claude Artifact Downloader

Turns a [claude.ai](https://claude.ai) artifact into a ready-to-use project zip
(`index.html` + generated README, optionally with inline CSS/JS split into separate
files). Two ways to use it:

- **Browser extension (recommended):** one click on the artifact page downloads the zip.
- **Web app:** paste the artifact URL, capture its HTML manually, package it as a zip.

Built with TypeScript; the web app is React + Vite. No backend: artifact content never
leaves your browser.

## Browser extension (recommended)

```bash
npm install
npm run build:extension
```

Then in Chrome/Edge: `chrome://extensions` → enable *Developer mode* → *Load unpacked* →
select `extension/dist`. Open any `https://claude.ai/code/artifact/…` page and click the
**⬇ Download zip** button that appears in the bottom-right corner.

How it works: a content script finds the artifact's content iframe (hosted on
`<uuid>.frame.claudeusercontent.com`), asks the extension service worker to fetch that
URL (its `host_permissions` exempt it from CORS), packages the HTML with the same pure
core used by the web app (`src/lib/`), and triggers the zip download from the artifact
page — which, unlike the sandboxed content frame, allows downloads.

## Why not just fetch from the web app?

A claude.ai artifact page (`https://claude.ai/code/artifact/<uuid>`) is only a shell.
The actual content is fetched by that page from claude.ai's authenticated, same-origin
API (`/api/frame/<uuid>`) and rendered inside an iframe hosted on
`<uuid>.frame.claudeusercontent.com`, guarded by a per-session asset token.

That means a third-party website — this app — cannot fetch the content directly:

- **CORS**: claude.ai does not allow cross-origin reads of those endpoints.
- **Authentication**: the API requires your claude.ai session cookies, which are never
  sent (or readable) cross-origin.
- **Bot protection**: server-side proxies get challenged by Cloudflare.

The only place the content is readable is your own browser tab, on the artifact page
itself. That is why projects like
[claude-artifacts-downloader](https://github.com/ashwanthkumar/claude-artifacts-downloader)
use a Chrome extension, and why this repo ships one too.

## Web app (no extension install)

If you can't install the extension, the web app offers a manual capture flow helped by a
small bookmarklet ([`src/lib/bookmarklet.ts`](src/lib/bookmarklet.ts)):

1. Run the app (see below) and paste an artifact URL, e.g.
   `https://claude.ai/code/artifact/<uuid>?org=<org-uuid>`.
2. Drag the **⬇ Save Claude Artifact** button to your bookmarks bar (one-time setup).
3. Open the artifact page, let it load, then click the bookmarklet — the artifact's
   content frame opens in a new tab.
4. On that tab, press `Cmd+S` (`Ctrl+S`) and save as *"Webpage, HTML Only"*. (The frame
   page is sandboxed by claude.ai against script-initiated downloads, so a bookmarklet
   cannot save the file for you — the browser's own Save menu can.)
5. Drop the file into the app, optionally enable *Extract inline CSS/JS*, and download
   the zip.

The zip contains:

```
<artifact-title>.zip
├── index.html      # the artifact, as served
├── css/…           # optional: extracted inline styles
├── js/…            # optional: extracted inline scripts
└── README.md       # source URL, download date, file list
```

## Development

```bash
npm install
npm run dev              # start the web app dev server
npm test                 # run unit tests (Vitest)
npm run typecheck        # TypeScript for both app and extension, no emit
npm run build            # typecheck + production build of the web app to dist/
npm run build:extension  # typecheck + bundle the extension to extension/dist/
```

After changing extension code, rebuild and hit the reload icon on
`chrome://extensions`.

## Project structure

The core logic is plain, pure, unit-tested functions; React components only wire them
to the UI.

```
src/
├── lib/                 # pure core, shared by the web app and the extension
│   ├── artifactUrl.ts   # parse claude.ai artifact URLs → {uuid, org, pageUrl}
│   ├── bookmarklet.ts   # companion bookmarklet source + javascript: URL builder
│   ├── htmlProject.ts   # captured HTML → project file list (title, split, README)
│   ├── zip.ts           # project file list → zip blob (JSZip)
│   └── download.ts      # trigger a browser download (only DOM side effect)
├── components/
│   ├── UrlStep.tsx      # step 1: paste & validate the URL
│   ├── CaptureStep.tsx  # step 2: capture instructions
│   └── PackageStep.tsx  # step 3: import HTML, options, download zip
├── App.tsx
└── main.tsx
extension/
├── manifest.json        # MV3 manifest (copied verbatim into the bundle)
└── src/
    ├── content.ts       # button UI + orchestration on artifact pages
    ├── background.ts    # service worker: CORS-exempt fetch of the content frame
    ├── frame.ts         # locate the content iframe (pure, tested)
    └── messages.ts      # typed message contract between the two
```

## Limitations

- Both flows depend on claude.ai's current page structure (the content iframe on
  `*.frame.claudeusercontent.com`). If claude.ai changes it, `extension/src/frame.ts`
  and/or the bookmarklet may need an update.
- The extension targets Chromium browsers (Chrome, Edge, Brave…). Firefox needs a
  slightly different manifest (`background.scripts`); Safari needs a converted build.
- Artifacts are captured as the single HTML document claude.ai serves. Remote assets
  referenced by the artifact (fonts, images on other hosts) are not bundled.
- You need access to the artifact in your own browser (logged in, or a link shared with
  you).

## License

[MIT](LICENSE) © 2026 Webidoo

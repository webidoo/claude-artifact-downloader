# Claude Artifact Downloader

A small client-side web app that turns a [claude.ai](https://claude.ai) artifact into a
ready-to-use project zip. Paste the artifact URL, capture its HTML with the companion
bookmarklet, and download a zip containing the page (optionally with inline CSS/JS split
into separate files) plus a generated README.

Built with React + Vite + TypeScript. No backend, no framework beyond React: artifact
content never leaves your browser.

## Why a bookmarklet?

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
itself. Projects like
[claude-artifacts-downloader](https://github.com/ashwanthkumar/claude-artifacts-downloader)
solve this with a Chrome extension; this app uses a **bookmarklet** instead — no
extension install, works in any browser, and the code is a short readable snippet in
[`src/lib/bookmarklet.ts`](src/lib/bookmarklet.ts).

## Usage

1. Run the app (see below) and paste an artifact URL, e.g.
   `https://claude.ai/code/artifact/<uuid>?org=<org-uuid>`.
2. Drag the **⬇ Save Claude Artifact** button to your bookmarks bar (one-time setup).
3. Open the artifact page, let it load, then click the bookmarklet — the artifact's
   content frame opens in a new tab.
4. Click the bookmarklet again on that tab — the artifact is saved as an `.html` file.
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
npm run dev        # start the dev server
npm test           # run unit tests (Vitest)
npm run typecheck  # TypeScript, no emit
npm run build      # typecheck + production build to dist/
```

## Project structure

The core logic is plain, pure, unit-tested functions; React components only wire them
to the UI.

```
src/
├── lib/
│   ├── artifactUrl.ts   # parse claude.ai artifact URLs → {uuid, org, pageUrl}
│   ├── bookmarklet.ts   # companion bookmarklet source + javascript: URL builder
│   ├── htmlProject.ts   # captured HTML → project file list (title, split, README)
│   ├── zip.ts           # project file list → zip blob (JSZip)
│   └── download.ts      # trigger a browser download (only DOM side effect)
├── components/
│   ├── UrlStep.tsx      # step 1: paste & validate the URL
│   ├── CaptureStep.tsx  # step 2: bookmarklet instructions
│   └── PackageStep.tsx  # step 3: import HTML, options, download zip
├── App.tsx
└── main.tsx
```

## Limitations

- The capture flow depends on claude.ai's current page structure (the content iframe on
  `*.frame.claudeusercontent.com`). If claude.ai changes it, the bookmarklet may need an
  update.
- Artifacts are captured as the single HTML document claude.ai serves. Remote assets
  referenced by the artifact (fonts, images on other hosts) are not bundled.
- You need access to the artifact in your own browser (logged in, or a link shared with
  you).

## License

[MIT](LICENSE) © 2026 Webidoo

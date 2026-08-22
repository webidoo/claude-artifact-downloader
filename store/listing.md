# Chrome Web Store listing

Reference material for filling in the Developer Dashboard forms.
Upload zip: `npm run package` → `release/artifact-downloader-for-claude-<version>.zip`.

## Basics

- **Name**: Artifact Downloader for Claude
- **Summary** (from manifest, max 132 chars):
  Download the claude.ai artifact you are viewing as a ready-to-use project zip.
  Unofficial - not affiliated with Anthropic.
- **Category**: Developer Tools
- **Language**: English

## Detailed description

```
Download any claude.ai artifact as a ready-to-use project zip, in one click.

Open an artifact page (claude.ai/code/artifact/… or a shared claude.ai/code/frame/…
link) and click the "Download zip" button in the bottom-right corner — or use the
toolbar popup. You get a zip containing:

• index.html — the artifact, exactly as served
• README.md — source URL, download date, file list

Everything runs locally in your browser. The extension collects no data, loads no
remote code, and only activates on claude.ai artifact pages.

Open source (MIT): https://github.com/webidoo/claude-artifact-downloader

This is an unofficial tool and is not affiliated with, endorsed by, or sponsored by
Anthropic. "Claude" is a trademark of Anthropic, PBC.
```

## Graphics

- **Store icon 128×128**: `icons/icon128.png`
- **Screenshots (1280×800 or 640×400, at least 1)** — take on a real artifact:
  1. An artifact page with the "⬇ Download zip" button visible bottom-right.
  2. The toolbar popup open on an artifact page.
  (Crop/resize to exactly 1280×800; avoid showing personal data in the page.)

## Privacy tab

- **Single purpose**: Download the claude.ai artifact being viewed as a project zip.
- **Permission justifications**:
  - `activeTab`: lets the toolbar popup act on the artifact tab the user invoked it
    from (read its URL, send it the download command).
  - Host access `claude.ai/code/artifact/*`, `claude.ai/code/frame/*` (content script):
    injects the download button on artifact pages and packages the zip there.
  - Host access `*.frame.claudeusercontent.com` (content script): reads the artifact
    document the user is viewing, same-origin, so it can be packaged.
- **Remote code**: none.
- **Data usage**: the extension does not collect, use, or share any user data. All
  checkboxes in the data-collection form: none.
- **Privacy policy URL**:
  https://github.com/webidoo/claude-artifact-downloader/blob/main/PRIVACY.md

## Distribution

- **Visibility**: Public
- **Regions**: all

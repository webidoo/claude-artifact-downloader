# Privacy Policy — Artifact Downloader for Claude

_Last updated: 2026-08-22_

Artifact Downloader for Claude is a browser extension that packages the claude.ai
artifact you are viewing into a zip file saved to your computer.

## Data collection

**The extension does not collect, store, or transmit any data.**

- No analytics, telemetry, or tracking of any kind.
- No data is sent to the developer or to any third party.
- No remote code is loaded or executed.

## How artifact content is handled

When you click the download button, the extension reads the HTML of the artifact you
are viewing — entirely inside your browser — packages it into a zip, and hands the zip
to your browser's download manager. The content never leaves your machine.

## Permissions

- `activeTab`: lets the toolbar popup act on the artifact tab you invoked it from.
- Content scripts on `claude.ai/code/artifact/*` and `claude.ai/code/frame/*`: show the
  download button on artifact pages.
- Content script on `*.frame.claudeusercontent.com`: read the artifact document you are
  viewing so it can be packaged.

The extension has no access to your claude.ai conversations, account, or any page other
than those listed above.

## Contact

Questions or concerns: open an issue at
https://github.com/webidoo/claude-artifact-downloader/issues

/**
 * The companion bookmarklet.
 *
 * claude.ai serves artifact content behind its own authenticated, same-origin
 * API (`/api/frame/<uuid>`), which is rendered into an iframe hosted on
 * `<uuid>.frame.claudeusercontent.com`. Browsers block a third-party site
 * (this app) from reading any of that (CORS + session cookies), so the
 * capture step has to run in the user's own tab, on the artifact page itself.
 * A bookmarklet is the lightest way to do that without a browser extension.
 *
 * On `claude.ai/code/artifact/...` it opens the content frame in a new tab.
 * The frame page itself is sandboxed by claude.ai in a way that blocks
 * page-initiated downloads (blob/anchor tricks are inert), so saving from
 * there must go through the browser UI (Cmd+S / Ctrl+S) — the bookmarklet
 * only reminds the user of that. For a one-click flow, use the browser
 * extension in `extension/` instead.
 */

const BOOKMARKLET_SOURCE = `(function(){
var h=location.hostname;
function fail(m){alert('Claude Artifact Downloader: '+m)}
if(/\\.frame\\.claudeusercontent\\.com$/.test(h)){
fail('Press Cmd+S (Ctrl+S on Windows) and save as "Webpage, HTML Only", then drop the file into the app.');
return;
}
if(h==='claude.ai'){
var f=document.querySelector('iframe[src*=".frame.claudeusercontent.com"]');
if(f&&f.src){window.open(f.src,'_blank');return}
fail('No artifact frame found. Let the artifact finish loading, then click again.');
return;
}
fail('Run this bookmarklet on a claude.ai artifact page.');
})();`

/** Returns the bookmarklet as a `javascript:` URL, ready for an anchor href. */
export function buildBookmarkletHref(): string {
  // Newlines are collapsed because some browsers strip them when a
  // bookmarklet is saved, which could otherwise break the code.
  return 'javascript:' + encodeURIComponent(BOOKMARKLET_SOURCE.replace(/\n/g, ''))
}

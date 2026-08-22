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
 * The same bookmarklet handles both pages it can land on:
 * 1. On `claude.ai/code/artifact/...` it opens the content frame in a new tab.
 * 2. On `*.frame.claudeusercontent.com` it downloads the page as an `.html`
 *    file, which this app then packages into a project zip.
 */

const BOOKMARKLET_SOURCE = `(function(){
var h=location.hostname;
function fail(m){alert('Claude Artifact Downloader: '+m)}
if(/\\.frame\\.claudeusercontent\\.com$/.test(h)){
var save=function(html){
var a=document.createElement('a');
a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));
a.download=(h.split('.')[0]||'artifact')+'.html';
document.body.appendChild(a);a.click();a.remove();
};
fetch(location.href,{credentials:'same-origin'})
.then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text()})
.then(save)
.catch(function(){save('<!doctype html> '+document.documentElement.outerHTML)});
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

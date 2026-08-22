/**
 * Turns a captured artifact HTML document into a small project layout.
 * Pure functions: input strings/options in, file list out.
 */

export interface ProjectFile {
  path: string
  content: string
}

export interface ArtifactProject {
  /** Slug used for the zip file name. */
  name: string
  files: ProjectFile[]
}

export interface BuildProjectOptions {
  /** Original artifact page URL, recorded in the generated README. */
  sourceUrl?: string
  /** When true, inline <style> and <script> blocks become separate files. */
  splitAssets?: boolean
  /** Timestamp recorded in the generated README. */
  generatedAt?: Date
}

const TITLE_RE = /<title[^>]*>([^<]*)<\/title>/i

export function extractTitle(html: string): string | null {
  const match = html.match(TITLE_RE)
  const title = match?.[1].trim()
  return title ? title : null
}

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return slug || 'claude-artifact'
}

interface SplitResult {
  html: string
  assets: ProjectFile[]
}

function isInlineScript(script: HTMLScriptElement): boolean {
  if (script.src) return false
  if (!script.textContent?.trim()) return false
  // Only executable scripts are extracted; data blocks (JSON, import maps,
  // templates, ...) must stay inline to keep the document working.
  const type = script.type.trim().toLowerCase()
  return type === '' || type === 'text/javascript' || type === 'module'
}

/**
 * Extracts inline styles and scripts into `css/` and `js/` files and rewrites
 * the document to reference them. Requires a DOM (browser or jsdom).
 */
export function splitInlineAssets(html: string): SplitResult {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const assets: ProjectFile[] = []

  doc.querySelectorAll('style').forEach((style, i) => {
    const content = style.textContent?.trim()
    if (!content) return
    const path = `css/style-${i + 1}.css`
    assets.push({ path, content: content + '\n' })
    const link = doc.createElement('link')
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('href', path)
    style.replaceWith(link)
  })

  doc.querySelectorAll('script').forEach((script, i) => {
    if (!isInlineScript(script)) return
    const path = `js/script-${i + 1}.js`
    assets.push({ path, content: (script.textContent ?? '').trim() + '\n' })
    const ref = doc.createElement('script')
    if (script.type) ref.setAttribute('type', script.type)
    ref.setAttribute('src', path)
    script.replaceWith(ref)
  })

  return { html: '<!doctype html>\n' + doc.documentElement.outerHTML + '\n', assets }
}

function buildReadme(title: string, options: BuildProjectOptions, fileList: string[]): string {
  const lines = [
    `# ${title}`,
    '',
    'Project packaged from a Claude artifact by Claude Artifact Downloader.',
    '',
  ]
  if (options.sourceUrl) lines.push(`- Source: ${options.sourceUrl}`)
  if (options.generatedAt) lines.push(`- Downloaded: ${options.generatedAt.toISOString()}`)
  lines.push('- Entry point: `index.html` (open it in a browser)', '', '## Files', '')
  for (const path of fileList) lines.push(`- \`${path}\``)
  lines.push('')
  return lines.join('\n')
}

/** Builds the full project file list for a captured artifact document. */
export function buildProject(html: string, options: BuildProjectOptions = {}): ArtifactProject {
  const title = extractTitle(html) ?? 'Claude artifact'
  const { html: indexHtml, assets } = options.splitAssets
    ? splitInlineAssets(html)
    : { html, assets: [] }

  const files: ProjectFile[] = [{ path: 'index.html', content: indexHtml }, ...assets]
  files.push({
    path: 'README.md',
    content: buildReadme(title, options, files.map((f) => f.path)),
  })

  return { name: slugify(title), files }
}

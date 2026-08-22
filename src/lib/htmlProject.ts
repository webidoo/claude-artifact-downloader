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

function buildReadme(title: string, options: BuildProjectOptions, fileList: string[]): string {
  const lines = [
    `# ${title}`,
    '',
    'Project packaged from a Claude artifact by Artifact Downloader for Claude.',
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
  const files: ProjectFile[] = [{ path: 'index.html', content: html }]
  files.push({
    path: 'README.md',
    content: buildReadme(title, options, files.map((f) => f.path)),
  })
  return { name: slugify(title), files }
}

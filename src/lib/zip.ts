import JSZip from 'jszip'
import type { ArtifactProject } from './htmlProject'

/** Packs a project's files into a zip blob. */
export async function zipProject(project: ArtifactProject): Promise<Blob> {
  const zip = new JSZip()
  for (const file of project.files) {
    zip.file(file.path, file.content)
  }
  return zip.generateAsync({ type: 'blob' })
}

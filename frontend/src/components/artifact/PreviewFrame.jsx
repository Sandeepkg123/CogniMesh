import { useMemo } from "react"
import { buildPreviewDocument } from "./artifact-utils"

export default function PreviewFrame({ files }) {
  const srcDoc = useMemo(() => buildPreviewDocument(files), [files])

  return (
    <iframe
      title="Artifact preview"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      className="h-full w-full border-0 bg-white"
    />
  )
}

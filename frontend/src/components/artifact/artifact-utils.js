export function getArtifactFiles(artifact) {
  if (!Array.isArray(artifact?.files)) return []

  return artifact.files.filter(
    (file) => file && typeof file.name === "string" && file.name.length > 0
  )
}

export function findFile(files, name) {
  const target = name.toLowerCase()
  return files.find((file) => file.name.toLowerCase() === target) || null
}

export function canPreviewArtifact(artifact) {
  return Boolean(findFile(getArtifactFiles(artifact), "index.html"))
}

export function getFileLanguage(fileName = "") {
  const name = fileName.toLowerCase()

  if (name.endsWith(".html") || name.endsWith(".htm")) return "html"
  if (name.endsWith(".css")) return "css"
  if (name.endsWith(".jsx")) return "jsx"
  if (name.endsWith(".tsx")) return "tsx"
  if (name.endsWith(".ts")) return "typescript"
  if (name.endsWith(".js") || name.endsWith(".mjs") || name.endsWith(".cjs")) {
    return "javascript"
  }
  if (name.endsWith(".json")) return "json"
  if (name.endsWith(".py")) return "python"

  return "plaintext"
}

/**
 * Composes a runnable document from the artifact's index.html, style.css, and
 * script.js. Generated index.html files are often full documents, so inject
 * the companion files instead of wrapping them in a second html element.
 */
export function buildPreviewDocument(files = []) {
  const html = findFile(files, "index.html")
  if (!html) return ""

  const css = findFile(files, "style.css")
  const js = findFile(files, "script.js")
  const styleTag = css?.content ? `<style>${css.content}</style>` : ""
  const scriptTag = js?.content
    ? `<script>${js.content.replace(/<\/script/gi, "<\\/script")}</script>`
    : ""

  let document = html.content || ""

  if (/<html[\s>]/i.test(document)) {
    if (styleTag) {
      if (/<\/head>/i.test(document)) {
        document = document.replace(/<\/head>/i, `${styleTag}</head>`)
      } else if (/<head[^>]*>/i.test(document)) {
        document = document.replace(/<head[^>]*>/i, (match) => `${match}${styleTag}`)
      } else {
        document = `${styleTag}${document}`
      }
    }

    if (scriptTag) {
      document = /<\/body>/i.test(document)
        ? document.replace(/<\/body>/i, `${scriptTag}</body>`)
        : `${document}${scriptTag}`
    }

    return document
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Artifact preview</title>
  ${styleTag}
</head>
<body>
  ${document}
  ${scriptTag}
</body>
</html>`
}

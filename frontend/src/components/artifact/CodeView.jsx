import { useMemo } from "react"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { syntaxHighlighting } from "@codemirror/language"
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark"
import { css } from "@codemirror/lang-css"
import { html } from "@codemirror/lang-html"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { python } from "@codemirror/lang-python"
import { getFileLanguage } from "./artifact-utils"

const editorTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "var(--code-bg)",
      color: "var(--foreground)",
      fontSize: "12.5px",
    },
    ".cm-scroller": {
      fontFamily:
        '"Geist Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace',
      lineHeight: "1.65",
      overflow: "auto",
    },
    ".cm-content": {
      padding: "16px 0",
      caretColor: "transparent",
    },
    ".cm-line": {
      padding: "0 16px",
    },
    ".cm-gutters": {
      backgroundColor: "var(--code-bg)",
      color: "var(--fg-faint)",
      borderRight: "1px solid var(--border)",
      fontSize: "10.5px",
      paddingLeft: "4px",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 8px 0 10px",
    },
    ".cm-activeLine": {
      backgroundColor: "transparent",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
    },
    ".cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(59, 110, 246, 0.28) !important",
    },
    ".cm-cursor": {
      display: "none",
    },
    ".cm-editor.cm-focused": {
      outline: "none",
    },
    ".cm-panels": {
      backgroundColor: "var(--card)",
      color: "var(--foreground)",
    },
  },
  { dark: true }
)

function languageExtension(fileName) {
  switch (getFileLanguage(fileName)) {
    case "html":
      return html()
    case "css":
      return css()
    case "javascript":
      return javascript()
    case "jsx":
      return javascript({ jsx: true })
    case "typescript":
      return javascript({ typescript: true })
    case "tsx":
      return javascript({ typescript: true, jsx: true })
    case "json":
      return json()
    case "python":
      return python()
    default:
      return null
  }
}

const basicSetup = {
  lineNumbers: true,
  highlightActiveLineGutter: false,
  foldGutter: false,
  dropCursor: false,
  allowMultipleSelections: false,
  indentOnInput: false,
  bracketMatching: false,
  closeBrackets: false,
  autocompletion: false,
  rectangularSelection: false,
  crosshairCursor: false,
  highlightActiveLine: false,
  highlightSelectionMatches: false,
  closeBracketsKeymap: false,
  searchKeymap: false,
  foldKeymap: false,
  completionKeymap: false,
  lintKeymap: false,
  history: false,
  defaultKeymap: false,
  historyKeymap: false,
}

export default function CodeView({ file }) {
  const language = useMemo(() => languageExtension(file?.name), [file?.name])
  const extensions = useMemo(
    () => [
      EditorView.lineWrapping,
      syntaxHighlighting(oneDarkHighlightStyle),
      ...(language ? [language] : []),
    ],
    [language]
  )

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <CodeMirror
        key={file?.name || "empty"}
        value={file?.content || ""}
        height="100%"
        theme={editorTheme}
        extensions={extensions}
        editable={false}
        readOnly
        basicSetup={basicSetup}
        className="h-full text-[12.5px]"
      />
    </div>
  )
}

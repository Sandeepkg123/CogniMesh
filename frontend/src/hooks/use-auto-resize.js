import { useEffect, useRef } from "react"

/**
 * Keeps a textarea sized to its content between two and eight rows.
 * Returns the ref that must be attached to the textarea.
 */
export function useAutoResize(value) {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    element.style.height = "auto"

    const styles = window.getComputedStyle(element)
    const lineHeight = Number.parseFloat(styles.lineHeight) || 24
    const minHeight = lineHeight * 2
    const maxHeight = lineHeight * 8
    const nextHeight = Math.min(Math.max(element.scrollHeight, minHeight), maxHeight)

    element.style.height = `${nextHeight}px`
    element.style.overflowY = element.scrollHeight > maxHeight ? "auto" : "hidden"
  }, [value])

  return ref
}

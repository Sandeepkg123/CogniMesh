import { createContext, useContext } from "react"

const fallback = {
  hasArtifact: false,
  collapsed: false,
  toggle: () => {},
  openMobile: () => {},
}

export const ArtifactPanelContext = createContext(fallback)

export function useArtifactPanel() {
  return useContext(ArtifactPanelContext)
}

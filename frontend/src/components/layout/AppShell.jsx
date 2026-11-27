import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSelector } from "react-redux"
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
  usePanelRef,
} from "react-resizable-panels"
import { useMediaQuery } from "../../hooks/use-media-query"
import ArtifactPanel from "../artifact/ArtifactPanel"
import { ArtifactPanelContext } from "../artifact/ArtifactContext"
import BillingSheet from "../billing/BillingSheet"
import CommandPalette from "../command/CommandPalette"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "../ui/sheet"
import MobileTopBar from "./MobileTopBar"
import Sidebar from "./Sidebar"

function readArtifactCollapsed() {
  try {
    return localStorage.getItem("cm.artifact") === "collapsed"
  } catch {
    return false
  }
}

export default function AppShell({ children }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const { artifacts } = useSelector((state) => state.message)
  const { userData } = useSelector((state) => state.user)
  const artifact = artifacts[0]
  const hasArtifact = Boolean(artifact)
  const artifactKey = artifact
    ? (artifact.id ?? artifact.title ?? "artifact")
    : null

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showBilling, setShowBilling] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [artifactCollapsed, setArtifactCollapsed] = useState(
    readArtifactCollapsed
  )
  const [mobileArtifactKey, setMobileArtifactKey] = useState(null)
  const artifactMobileOpen = Boolean(
    hasArtifact && mobileArtifactKey !== null && mobileArtifactKey === artifactKey
  )

  const sidebarRef = usePanelRef()
  const artifactPanelRef = usePanelRef()
  const artifactMountedRef = useRef(false)

  const layout = useDefaultLayout({
    id: "cognimesh-shell",
    panelIds: hasArtifact
      ? ["sidebar", "chat", "artifact"]
      : ["sidebar", "chat"],
  })

  useEffect(() => {
    try {
      localStorage.setItem(
        "cm.artifact",
        artifactCollapsed ? "collapsed" : "open"
      )
    } catch {
      // Storage can be unavailable in restricted contexts.
    }
  }, [artifactCollapsed])

  useEffect(() => {
    if (!hasArtifact) {
      artifactMountedRef.current = false
      return
    }

    if (!isDesktop) {
      artifactMountedRef.current = false
      return
    }

    if (artifactMountedRef.current) return
    artifactMountedRef.current = true

    // The panel registers its constraints after mount; applying the saved
    // collapsed state in a frame avoids racing that registration.
    const frame = requestAnimationFrame(() => {
      const panel = artifactPanelRef.current
      if (!panel) return

      if (artifactCollapsed) panel.collapse()
      else panel.expand()
    })

    return () => cancelAnimationFrame(frame)
  }, [artifactCollapsed, artifactPanelRef, hasArtifact, isDesktop])

  const toggleSidebar = useCallback(() => {
    if (!isDesktop) {
      setMobileArtifactKey(null)
      setMobileOpen((open) => !open)
      return
    }

    const panel = sidebarRef.current
    if (!panel) return
    if (panel.isCollapsed()) panel.expand()
    else panel.collapse()
  }, [isDesktop, sidebarRef])

  const openBilling = useCallback(() => {
    setMobileOpen(false)
    setMobileArtifactKey(null)
    setShowBilling(true)
  }, [])

  const openCommandPalette = useCallback(() => {
    setMobileOpen(false)
    setCommandOpen(true)
  }, [])

  const closeMobile = useCallback(() => {
    setMobileOpen(false)
  }, [])

  const toggleArtifact = useCallback(() => {
    if (!isDesktop) {
      setMobileOpen(false)
      setMobileArtifactKey((current) =>
        current === artifactKey ? null : artifactKey
      )
      return
    }

    const panel = artifactPanelRef.current
    if (!panel) return
    if (panel.isCollapsed()) panel.expand()
    else panel.collapse()
  }, [artifactKey, artifactPanelRef, isDesktop])

  const openArtifactMobile = useCallback(() => {
    setMobileArtifactKey(artifactKey)
  }, [artifactKey])

  const closeArtifactMobile = useCallback(() => {
    setMobileArtifactKey(null)
  }, [])

  const artifactContext = useMemo(
    () => ({
      hasArtifact,
      collapsed: artifactCollapsed,
      toggle: toggleArtifact,
      openMobile: openArtifactMobile,
    }),
    [artifactCollapsed, hasArtifact, openArtifactMobile, toggleArtifact]
  )

  const desktopContent = (
    <>
      <Group
        id="cognimesh-shell"
        orientation="horizontal"
        className="h-full min-w-0 flex-1"
        {...layout}
      >
        <Panel
          id="sidebar"
          defaultSize={260}
          minSize={200}
          maxSize={320}
          collapsible
          collapsedSize={56}
          panelRef={sidebarRef}
          onResize={(size) => setCollapsed(size.inPixels < 160)}
          className="min-w-0"
        >
          <Sidebar
            collapsed={collapsed}
            onToggleCollapsed={toggleSidebar}
            onOpenBilling={openBilling}
            onOpenCommandPalette={openCommandPalette}
          />
        </Panel>

        <Separator className="w-px bg-border transition-colors data-[separator=hover]:bg-primary/40 data-[separator=active]:bg-primary" />

        <Panel id="chat" minSize={420} className="min-w-0">
          {children}
        </Panel>

        {hasArtifact && (
          <Separator className="w-px bg-border transition-colors data-[separator=hover]:bg-primary/40 data-[separator=active]:bg-primary" />
        )}

        {hasArtifact && (
          <Panel
            id="artifact"
            defaultSize={420}
            minSize={320}
            maxSize="60"
            collapsible
            collapsedSize={48}
            panelRef={artifactPanelRef}
            onResize={(size) => {
              if (size.inPixels > 0) {
                setArtifactCollapsed(size.inPixels < 120)
              }
            }}
            className="min-w-0"
          >
            <ArtifactPanel
              key={artifactKey}
              artifact={artifact}
              collapsed={artifactCollapsed}
              onToggleCollapsed={toggleArtifact}
              onClose={toggleArtifact}
            />
          </Panel>
        )}
      </Group>
    </>
  )

  const mobileContent = (
    <>
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <MobileTopBar onMenu={() => setMobileOpen(true)} />

        <div className="min-h-0 flex-1">{children}</div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="w-[280px] gap-0 border-r border-border bg-card p-0"
          >
            <SheetTitle className="sr-only">Chats</SheetTitle>
            <SheetDescription className="sr-only">
              Browse and manage your conversations.
            </SheetDescription>
            <Sidebar
              mobile
              onNavigate={closeMobile}
              onOpenBilling={openBilling}
              onOpenCommandPalette={openCommandPalette}
            />
          </SheetContent>
        </Sheet>
      </div>

      <Sheet
        open={artifactMobileOpen}
        onOpenChange={(open) =>
          setMobileArtifactKey(open ? artifactKey : null)
        }
      >
        <SheetContent
          side="right"
          showCloseButton={false}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="w-[92vw] max-w-[520px] gap-0 border-l border-border bg-card p-0 data-[side=right]:w-[92vw] data-[side=right]:sm:max-w-[520px]"
        >
          <SheetTitle className="sr-only">Artifact</SheetTitle>
          <SheetDescription className="sr-only">
            View generated files and preview.
          </SheetDescription>
          {artifact && (
            <ArtifactPanel
              key={artifactKey}
              artifact={artifact}
              mobile
              onClose={closeArtifactMobile}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )

  return (
    <ArtifactPanelContext.Provider value={artifactContext}>
      {isDesktop ? desktopContent : mobileContent}

      <BillingSheet open={showBilling} onOpenChange={setShowBilling} />

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        enabled={Boolean(userData)}
        onToggleSidebar={toggleSidebar}
        onOpenBilling={openBilling}
        onNavigate={closeMobile}
      />
    </ArtifactPanelContext.Provider>
  )
}

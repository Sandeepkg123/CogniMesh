import { useState } from "react"
import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
  usePanelRef,
} from "react-resizable-panels"
import { useMediaQuery } from "../../hooks/use-media-query"
import BillingDrawer from "../BillingDrawer"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "../ui/sheet"
import MobileTopBar from "./MobileTopBar"
import Sidebar from "./Sidebar"

export default function AppShell({ children }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showBilling, setShowBilling] = useState(false)

  const sidebarRef = usePanelRef()
  const layout = useDefaultLayout({
    id: "cognimesh-shell",
    panelIds: ["sidebar", "chat"],
  })

  const toggleSidebar = () => {
    const panel = sidebarRef.current
    if (!panel) return
    if (panel.isCollapsed()) panel.expand()
    else panel.collapse()
  }

  const openBilling = () => {
    setMobileOpen(false)
    setShowBilling(true)
  }

  if (!isDesktop) {
    return (
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
                onNavigate={() => setMobileOpen(false)}
                onOpenBilling={openBilling}
              />
            </SheetContent>
          </Sheet>
        </div>

        <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
      </>
    )
  }

  return (
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
          />
        </Panel>

        <Separator className="w-px bg-border transition-colors data-[separator=hover]:bg-primary/40 data-[separator=active]:bg-primary" />

        <Panel id="chat" minSize={420} className="min-w-0">
          {children}
        </Panel>
      </Group>

      <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
    </>
  )
}

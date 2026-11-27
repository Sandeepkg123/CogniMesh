import { useSelector } from "react-redux"
import LoginDialog from "../components/auth/LoginDialog"
import ChatArea from "../components/ChatArea"
import AppShell from "../components/layout/AppShell"

function Home() {
  const { userData } = useSelector((state) => state.user)

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <AppShell>
        <ChatArea />
      </AppShell>

      <LoginDialog open={!userData} />
    </div>
  )
}

export default Home

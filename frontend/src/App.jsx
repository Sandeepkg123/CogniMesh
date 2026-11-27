import { useEffect } from "react"
import Home from "./pages/Home"
import getCurrentUser from "./features/getCurrentUser"
import { useDispatch } from "react-redux"
import { setUserdata } from "./redux/userSlice"
import { TooltipProvider } from "./components/ui/tooltip"
import { Toaster } from "./components/ui/sonner"
import { useMediaQuery } from "./hooks/use-media-query"

function App() {
  const dispatch = useDispatch()
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  useEffect(() => {
    const getUser = async () => {
      const data = await getCurrentUser()
      dispatch(setUserdata(data))
    }
    getUser()
  }, [dispatch])

  return (
    <TooltipProvider delayDuration={300}>
      <Home />
      <Toaster
        theme="dark"
        richColors
        duration={3000}
        offset={{ bottom: 180, right: 24 }}
        position={isDesktop ? "bottom-right" : "top-center"}
      />
    </TooltipProvider>
  )
}

export default App

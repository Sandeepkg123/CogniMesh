import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "../../utils/firebase"
import api from "../../utils/axios"
import { FcGoogle } from "react-icons/fc"
import { useDispatch, useSelector } from "react-redux"
import { setUserdata } from "../redux/userSlice"
import AppShell from "../components/layout/AppShell"
import BrandMark from "../components/layout/BrandMark"
import ChatArea from "../components/ChatArea"
import Artifact from "../components/Artifact"

function Home() {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  const handleLogin = async (token) => {
    try {
      const { data } = await api.post("/api/auth/login", { token })
      dispatch(setUserdata(data))
    } catch (error) {
      console.error(error)
    }
  }

  const googleLogin = async () => {
    const data = await signInWithPopup(auth, googleProvider)
    const token = await data.user.getIdToken()
    await handleLogin(token)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <AppShell>
        <ChatArea />
      </AppShell>

      <Artifact />

      {!userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="flex w-[380px] max-w-full flex-col gap-5 rounded-2xl border border-border bg-popover p-7 shadow-2xl">
            <div className="flex flex-col gap-3">
              <BrandMark className="size-8" />
              <div className="flex flex-col gap-1">
                <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
                  Welcome to CogniMesh
                </h2>
                <p className="text-[13px] leading-relaxed text-fg-subtle">
                  Chat, write code, analyze documents, and build decks in one place.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-white py-[11px] text-sm font-medium text-black/90 transition-colors hover:bg-gray-200"
              onClick={googleLogin}
            >
              <FcGoogle size={15} />
              Continue with Google
            </button>

            <p className="text-center text-[11px] leading-relaxed text-fg-faint">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home

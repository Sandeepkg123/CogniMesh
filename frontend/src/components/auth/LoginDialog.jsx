import { useRef, useState } from "react"
import { signInWithPopup } from "firebase/auth"
import { Loader2 } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { useDispatch } from "react-redux"
import { toast } from "sonner"
import api from "../../../utils/axios"
import { auth, googleProvider } from "../../../utils/firebase"
import { setUserdata } from "../../redux/userSlice"
import BrandMark from "../layout/BrandMark"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog"

export default function LoginDialog({ open }) {
  const dispatch = useDispatch()
  const [signingIn, setSigningIn] = useState(false)
  const titleRef = useRef(null)

  const handleGoogleLogin = async () => {
    if (signingIn) return

    setSigningIn(true)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const token = await result.user.getIdToken()
      const { data } = await api.post("/api/auth/login", { token })
      dispatch(setUserdata(data))
    } catch (error) {
      console.error(error)
      const code = error?.code
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        return
      }
      toast.error("Sign-in failed. Please try again.")
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/70 supports-backdrop-filter:backdrop-blur-sm"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          titleRef.current?.focus()
        }}
        className="w-[380px] max-w-[calc(100vw-2rem)] gap-0 rounded-2xl border border-border bg-popover p-7 shadow-2xl sm:max-w-[380px]"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <BrandMark className="size-8" />

            <div className="flex flex-col gap-1">
              <DialogTitle
                ref={titleRef}
                tabIndex={-1}
                className="text-[17px] font-semibold tracking-tight text-foreground outline-none"
              >
                Welcome to CogniMesh
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed text-fg-subtle">
                Chat, write code, analyze documents, and build decks in one
                place.
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={signingIn}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-white py-[11px] text-sm font-medium text-black/90 outline-none transition-colors hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-popover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingIn ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FcGoogle size={15} />
            )}
            {signingIn ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="text-center text-[11px] leading-relaxed text-fg-faint">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

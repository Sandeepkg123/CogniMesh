import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ChevronsUpDown, Coins, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import logOut from "../../features/logOut"
import { setUserdata } from "../../redux/userSlice"
import { cn } from "../../lib/utils"

function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function UserAvatar({ user, size = "md" }) {
  const [imageError, setImageError] = useState(false)
  const dimension = size === "sm" ? "size-7" : "size-8"

  if (user?.avatar && !imageError) {
    return (
      <img
        src={user.avatar}
        alt=""
        onError={() => setImageError(true)}
        className={cn(dimension, "shrink-0 rounded-full border border-border object-cover")}
      />
    )
  }

  return (
    <span
      className={cn(
        dimension,
        "flex shrink-0 items-center justify-center rounded-full border border-border bg-elevated text-[10px] font-semibold text-fg-subtle"
      )}
    >
      {initials(user?.name)}
    </span>
  )
}

export default function UserCard({ onOpenBilling }) {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  const handleLogout = async () => {
    await logOut()
    dispatch(setUserdata(null))
  }

  if (!userData) {
    return (
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-t border-border px-3">
        <span className="size-8 shrink-0 rounded-full border border-border bg-elevated" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-fg-subtle">Signed out</p>
          <p className="truncate text-[11px] text-fg-faint">Sign in to save your chats</p>
        </div>
      </div>
    )
  }

  const plan = userData.plan
    ? userData.plan.charAt(0).toUpperCase() + userData.plan.slice(1)
    : "Free"
  const credits = Number(userData.credits ?? 0).toLocaleString()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-16 w-full shrink-0 items-center gap-2.5 border-t border-border px-3 text-left outline-none transition-colors hover:bg-hover focus-visible:bg-hover"
        >
          <UserAvatar user={userData} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-foreground">
              {userData.name || "Account"}
            </span>
            <span className="block truncate text-[11px] text-fg-subtle">
              {plan} · {credits} credits
            </span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-fg-faint" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="top" sideOffset={8} className="w-56!">
        <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
          <span className="truncate text-[13px] font-medium text-foreground">
            {userData.name || "Account"}
          </span>
          <span className="truncate text-[11px] font-normal text-fg-subtle">{userData.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onOpenBilling?.()}>
          <Coins />
          Billing &amp; credits
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

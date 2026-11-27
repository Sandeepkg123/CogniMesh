import { useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Crown, Lock, X } from "lucide-react"
import { toast } from "sonner"
import { createOrder } from "../../features/createOrder"
import getCurrentUser from "../../features/getCurrentUser"
import { verifyPayment } from "../../features/verifyPayment"
import { getCreditTotal, getPlan, PLANS } from "../../lib/plans"
import { setUserdata } from "../../redux/userSlice"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "../ui/sheet"
import CreditsMeter from "./CreditsMeter"
import PlanCard from "./PlanCard"

export default function BillingSheet({ open, onOpenChange }) {
  const dispatch = useDispatch()
  const { userData } = useSelector((state) => state.user)
  const [upgrading, setUpgrading] = useState(null)
  const titleRef = useRef(null)

  const currentPlanId = userData?.plan || "free"
  const currentPlan = getPlan(currentPlanId)
  const credits = Number(userData?.credits ?? 0)
  const totalCredits = getCreditTotal(userData)

  const handleUpgrade = async (plan) => {
    if (upgrading || plan.amount <= 0 || plan.id === currentPlanId) return

    setUpgrading(plan.id)

    try {
      const data = await createOrder(plan.id)

      if (!data?.order?.id) {
        toast.error("Could not start checkout. Please try again.")
        return
      }

      if (typeof window.Razorpay !== "function") {
        toast.error("Checkout is unavailable right now. Please try again.")
        return
      }

      const razorpay = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "CogniMesh",
        description: `${data.plan?.name || plan.name} Plan`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const result = await verifyPayment(response)

            if (!result || Array.isArray(result)) {
              toast.error(
                "Payment could not be verified. Please contact support if you were charged."
              )
              return
            }

            toast.success("Payment successful. Your credits have been added.")

            const user = await getCurrentUser()
            if (user) dispatch(setUserdata(user))
          } catch (error) {
            console.error(error)
            toast.error(
              "Payment could not be verified. Please contact support if you were charged."
            )
          }
        },
        theme: {
          color: "#3B6EF6",
        },
      })

      if (typeof razorpay.on === "function") {
        razorpay.on("payment.failed", (response) => {
          toast.error(
            response?.error?.description || "Payment failed. Please try again."
          )
        })
      }

      razorpay.open()
    } catch (error) {
      console.error(error)
      toast.error("Could not start checkout. Please try again.")
    } finally {
      setUpgrading(null)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          titleRef.current?.focus()
        }}
        className="w-[420px] max-w-[calc(100vw-1rem)] gap-0 border-l border-border bg-card p-0 data-[side=right]:w-[420px] data-[side=right]:max-w-[calc(100vw-1rem)] data-[side=right]:sm:max-w-[420px]"
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-5">
          <div className="min-w-0">
            <SheetTitle
              ref={titleRef}
              tabIndex={-1}
              className="text-[15px] font-semibold tracking-tight text-foreground outline-none"
            >
              Billing
            </SheetTitle>
            <SheetDescription className="text-[12px] text-fg-subtle">
              Plans &amp; credits
            </SheetDescription>
          </div>

          <SheetClose asChild>
            <button
              type="button"
              aria-label="Close billing"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <X className="size-4" />
            </button>
          </SheetClose>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="rounded-xl border border-border bg-elevated p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-medium tracking-[0.14em] text-fg-faint uppercase">
                  Current plan
                </p>
                <p className="mt-1 text-[18px] font-semibold tracking-tight text-foreground">
                  {currentPlan.name}
                </p>
                <p className="mt-1 text-[12px] text-fg-subtle">
                  {currentPlan.tagline}
                </p>
              </div>

              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-warning/20 bg-warning/10">
                <Crown className="size-4 text-warning" />
              </div>
            </div>

            <CreditsMeter
              credits={credits}
              total={totalCredits}
              className="mt-4"
            />
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-medium tracking-[0.14em] text-fg-faint uppercase">
              Plans
            </p>

            <div className="mt-2 space-y-3">
              {PLANS.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  currentPlanId={currentPlanId}
                  popular={plan.popular}
                  onUpgrade={handleUpgrade}
                  loading={upgrading === plan.id}
                  disabled={Boolean(upgrading)}
                />
              ))}
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-fg-faint">
              <Lock className="size-3" />
              Payments are securely processed by Razorpay.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

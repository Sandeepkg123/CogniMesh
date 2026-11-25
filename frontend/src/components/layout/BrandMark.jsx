import { cn } from "../../lib/utils"

export default function BrandMark({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-6 shrink-0", className)}
    >
      <rect width="24" height="24" rx="6" className="fill-primary" />
      <path
        d="M7 8.5 12 12l5-3.5M7 15.5 12 12l5 3.5"
        stroke="white"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="7" cy="8.5" r="1.5" fill="white" />
      <circle cx="17" cy="8.5" r="1.5" fill="white" />
      <circle cx="12" cy="12" r="1.6" fill="white" />
      <circle cx="7" cy="15.5" r="1.5" fill="white" />
      <circle cx="17" cy="15.5" r="1.5" fill="white" />
    </svg>
  )
}

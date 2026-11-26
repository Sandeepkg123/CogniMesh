import { Skeleton } from "../ui/skeleton"

export default function MessageSkeleton({ count = 3 }) {
  return (
    <div className="space-y-6" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="size-6 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-[38%]" />
            <Skeleton className="h-3 w-[92%]" />
            <Skeleton className="h-3 w-[76%]" />
          </div>
        </div>
      ))}
    </div>
  )
}

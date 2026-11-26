import { X } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "../ui/dialog"

export default function Lightbox({ src, onClose }) {
  return (
    <Dialog
      open={Boolean(src)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-[92vw] gap-0 border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-[92vw]"
      >
        <DialogTitle className="sr-only">Image preview</DialogTitle>

        {src && (
          <img
            src={src}
            alt="Image preview"
            className="max-h-[85vh] w-auto rounded-xl border border-border object-contain"
          />
        )}

        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close image preview"
            className="absolute -right-2 -top-2 flex size-9 items-center justify-center rounded-full border border-border bg-popover text-foreground shadow-lg outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <X className="size-4" />
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

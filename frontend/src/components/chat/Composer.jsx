import { Mic, MicOff, Paperclip, Send, Square } from "lucide-react"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { useAutoResize } from "../../hooks/use-auto-resize"
import { cn } from "../../lib/utils"
import { setAgent } from "../../redux/messageSlice"
import AgentPicker from "./AgentPicker"
import AttachmentChip from "./AttachmentChip"

const PLACEHOLDERS = {
  auto: "Ask anything…",
  chat: "Ask anything…",
  search: "Search the web…",
  coding: "Describe what you want to build…",
  pdf: "Describe the document you want…",
  ppt: "Describe the slides you want…",
  vision: "Describe the image you want…",
}

const ALLOWED_IMAGES = new Set(["image/png", "image/jpeg", "image/webp"])
const MAX_FILE_SIZE = 20 * 1024 * 1024

const Composer = forwardRef(function Composer(
  {
    draft,
    onDraftChange,
    attachment,
    onAttachmentChange,
    onSend,
    onStop,
    isLoading,
  },
  ref
) {
  const dispatch = useDispatch()
  const agentId = useSelector((state) => state.message.agent)
  const textareaRef = useAutoResize(draft)
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)
  const [listening, setListening] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useImperativeHandle(
    ref,
    () => ({
      focus: () => textareaRef.current?.focus(),
      openFilePicker: () => fileInputRef.current?.click(),
    }),
    [textareaRef]
  )

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true
    recognition.continuous = true

    recognition.onresult = (event) => {
      let transcript = ""
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript
      }
      onDraftChange(transcript)
    }

    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition

    return () => {
      recognition.onresult = null
      recognition.onend = null
      recognition.onerror = null
      try {
        recognition.abort()
      } catch {
        // The recognizer may not have started.
      }
      recognitionRef.current = null
    }
  }, [onDraftChange])

  const toggleMic = () => {
    const recognition = recognitionRef.current

    if (!recognition) {
      toast.error("Speech recognition isn't supported in this browser.")
      return
    }

    if (listening) {
      recognition.stop()
      setListening(false)
      return
    }

    try {
      recognition.start()
      setListening(true)
    } catch {
      toast.error("Could not start the microphone.")
      setListening(false)
    }
  }

  const handleFile = (file) => {
    if (!file) return

    const allowed =
      file.type === "application/pdf" || ALLOWED_IMAGES.has(file.type)

    if (!allowed) {
      toast.error("Attach a PDF, PNG, JPEG, or WEBP file.")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. The limit is 20 MB.")
      return
    }

    onAttachmentChange(file)
    dispatch(setAgent("auto"))
  }

  const removeAttachment = () => {
    onAttachmentChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSend = async () => {
    if (isLoading) return

    const fallback = attachment
      ? attachment.type === "application/pdf"
        ? "Analyze this PDF"
        : "Analyze this image"
      : ""
    const text = draft.trim() || fallback

    if (!text && !attachment) return

    const result = await onSend({
      text,
      file: attachment,
      agent: attachment ? "auto" : undefined,
    })

    if (result) {
      onDraftChange("")
      onAttachmentChange(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault()
      if (!isLoading) handleSend()
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDragging(false)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files?.[0])
  }

  const handlePaste = (event) => {
    const file = event.clipboardData?.files?.[0]
    if (!file) return
    event.preventDefault()
    handleFile(file)
  }

  const placeholder = attachment
    ? attachment.type === "application/pdf"
      ? "Ask about this PDF…"
      : "Ask about this image…"
    : PLACEHOLDERS[agentId] || PLACEHOLDERS.auto

  return (
    <div className="shrink-0 border-t border-border bg-background">
      <div className="mx-auto w-full max-w-[45rem] px-4 py-4 md:px-6">
        <div
          aria-busy={isLoading}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "rounded-xl border border-border bg-popover transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15",
            isDragging && "border-primary ring-2 ring-primary/20"
          )}
        >
          {attachment && (
            <div className="border-b border-border p-2">
              <AttachmentChip
                key={`${attachment.name}-${attachment.size}-${attachment.lastModified}`}
                file={attachment}
                onRemove={removeAttachment}
              />
            </div>
          )}

          <textarea
            ref={textareaRef}
            aria-label="Message"
            value={draft}
            rows={2}
            maxLength={20000}
            placeholder={placeholder}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className="block w-full resize-none bg-transparent px-3.5 py-3 text-[13.5px] leading-6 text-foreground outline-none placeholder:text-fg-faint"
          />

          <div className="flex items-center gap-1 px-2 pb-2">
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              hidden
              ref={fileInputRef}
              onChange={(event) => {
                handleFile(event.target.files?.[0])
                event.target.value = ""
              }}
            />

            <button
              type="button"
              aria-label="Attach a file"
              title="Attach a PDF or image"
              onClick={() => fileInputRef.current?.click()}
              className="flex size-8 items-center justify-center rounded-lg text-fg-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Paperclip className="size-4" />
            </button>

            <button
              type="button"
              aria-label={listening ? "Stop dictation" : "Dictate a message"}
              title={listening ? "Stop dictation" : "Dictate"}
              onClick={toggleMic}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                listening
                  ? "bg-destructive/15 text-destructive hover:bg-destructive/20"
                  : "text-fg-subtle hover:bg-hover hover:text-foreground"
              )}
            >
              {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              <div className="lg:hidden">
                <AgentPicker compact disabled={Boolean(attachment)} />
              </div>

              {isLoading ? (
                <button
                  type="button"
                  aria-label="Stop generating"
                  title="Stop generating"
                  onClick={onStop}
                  className="flex size-8 items-center justify-center rounded-lg bg-elevated text-foreground outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <Square className="size-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label="Send message"
                  title="Send"
                  disabled={!draft.trim() && !attachment}
                  onClick={handleSend}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                    draft.trim() || attachment
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "cursor-not-allowed bg-elevated text-fg-faint"
                  )}
                >
                  <Send className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 px-1 text-[10.5px] text-fg-faint">
          <span className="hidden sm:inline">Enter to send · Shift+Enter for newline</span>
          <span>CogniMesh can make mistakes.</span>
        </div>
      </div>
    </div>
  )
})

Composer.displayName = "Composer"

export default Composer

import { useCallback, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { createConversation } from "../features/createConversation"
import sendMessage from "../features/sendMessage"
import { updateConversation } from "../features/updateConversation"
import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
} from "../redux/conversationSlice"
import {
  addMessage,
  setArtifacts,
  setIsLoading,
  setMessages,
} from "../redux/messageSlice"

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function notifySendError(error) {
  const status = error?.response?.status
  const body = error?.response?.data
  const message = typeof body?.message === "string" ? body.message : null

  if (status === 429) {
    toast.warning(message || "Rate limit reached. Please try again shortly.", {
      duration: 5000,
    })
    return
  }

  if (status === 402) {
    toast.error(message || "You're out of credits. Upgrade to continue.")
    return
  }

  toast.error(message || "The message failed. Please try again.")
}

/**
 * Owns the send lifecycle for the active conversation: conversation creation,
 * title update, optimistic user message, assistant response, abort, and
 * regeneration. Used by both the composer and the message action row.
 */
export function useSendMessage() {
  const dispatch = useDispatch()
  const { selectedConversation } = useSelector((state) => state.conversation)
  const { agent, isLoading, messages } = useSelector((state) => state.message)
  const abortRef = useRef(null)

  const send = useCallback(
    async ({
      text,
      file = null,
      agent: requestedAgent = agent,
      skipUserMessage = false,
    }) => {
      if (abortRef.current) return null

      const prompt = (text || "").trim()
      if (!prompt && !file) return null

      const controller = new AbortController()
      abortRef.current = controller
      dispatch(setIsLoading(true))

      try {
        let conversation = selectedConversation

        if (!conversation) {
          const created = await createConversation()

          if (!created?._id) {
            toast.error("Could not start a new conversation.")
            return null
          }

          dispatch(setSelectedConversation(created))
          dispatch(addConversation(created))
          conversation = created
        }

        const title = prompt || file?.name || "New Chat"

        if (conversation.title === "New Chat") {
          await updateConversation({
            id: conversation._id,
            title: title.slice(0, 200),
          })
          dispatch(
            setConvTitle({
              conversationId: conversation._id,
              title: title.slice(0, 40),
            })
          )
        }

        if (!skipUserMessage) {
          dispatch(
            addMessage({
              id: createId(),
              role: "user",
              content: prompt,
              createdAt: new Date().toISOString(),
            })
          )
        }

        const formData = new FormData()
        formData.append("prompt", prompt)
        formData.append("conversationId", conversation._id)
        formData.append("agent", requestedAgent || "auto")
        if (file) formData.append("file", file)

        const data = await sendMessage(formData, { signal: controller.signal })

        if (controller.signal.aborted) return null

        if (data?.error) {
          notifySendError(data.error)
          return null
        }

        if (!data) {
          toast.error("The message failed. Please try again.")
          return null
        }

        if (Array.isArray(data?.artifacts) && data.artifacts.length > 0) {
          dispatch(setArtifacts(data.artifacts))
        }
        dispatch(
          addMessage({
            id: createId(),
            role: "assistant",
            content: data?.answer ?? "",
            images: Array.isArray(data?.images) ? data.images : [],
            agent: data?.agent,
            requestedAgent,
            createdAt: new Date().toISOString(),
          })
        )

        return data
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error)
          notifySendError(error)
        }
        return null
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null
          dispatch(setIsLoading(false))
        }
      }
    },
    [agent, dispatch, selectedConversation]
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    dispatch(setIsLoading(false))
  }, [dispatch])

  const regenerate = useCallback(
    async (messageIndex) => {
      if (isLoading || abortRef.current) return

      const target = messages[messageIndex]
      if (!target || target.role !== "assistant") return

      let userIndex = messageIndex - 1
      while (userIndex >= 0 && messages[userIndex].role !== "user") {
        userIndex -= 1
      }

      if (userIndex < 0) return

      const prompt = messages[userIndex].content
      if (!prompt) return

      dispatch(setMessages(messages.slice(0, messageIndex)))

      await send({
        text: prompt,
        agent: target.requestedAgent || target.agent || "auto",
        skipUserMessage: true,
      })
    },
    [dispatch, isLoading, messages, send]
  )

  return { send, stop, regenerate, isLoading }
}

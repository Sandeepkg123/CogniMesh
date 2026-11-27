import mongoose from "mongoose"
import Conversation from "../models/coversation.model.js"
import Message from "../models/message.model.js"

export const createConversation = async (req, res) => {
  try {
    const conversation = await Conversation.create({
      userId: req.userId
    })

    return res.status(200).json(conversation)
  } catch (error) {
    console.error("create conversation error", error)
    return res.status(500).json({ message: "failed to create conversation" })
  }
}

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      userId: req.userId
    }).sort({ updatedAt: -1 })

    return res.status(200).json(conversations)
  } catch (error) {
    console.error("get conversation error", error)
    return res.status(500).json({ message: "failed to get conversations" })
  }
}

export const updateConversation = async (req, res) => {
  try {
    const { id, title } = req.body || {}

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "invalid conversation id" })
    }

    if (typeof title !== "string" || title.length > 200) {
      return res.status(400).json({ message: "invalid title" })
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { title },
      { new: true }
    )

    if (!conversation) {
      return res.status(404).json({ message: "conversation not found" })
    }

    return res.status(200).json(conversation)
  } catch (error) {
    console.error("update conversation error", error)
    return res.status(500).json({ message: "failed to update conversation" })
  }
}

export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content, agent, images, artifacts } = req.body || {}

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ message: "invalid conversation id" })
    }

    if (role !== "user" && role !== "assistant") {
      return res.status(400).json({ message: "invalid role" })
    }

    if (typeof content !== "string" || content.length > 100000) {
      return res.status(400).json({ message: "invalid content" })
    }

    const validImages = images === undefined || (
      Array.isArray(images) &&
      images.length <= 10 &&
      images.every((image) => typeof image === "string" && image.length <= 2000)
    )

    if (!validImages || (artifacts !== undefined && !Array.isArray(artifacts))) {
      return res.status(400).json({ message: "invalid message data" })
    }

    const conversation = await Conversation.exists({
      _id: conversationId,
      userId: req.userId
    })

    if (!conversation) {
      return res.status(404).json({ message: "conversation not found" })
    }

    const message = await Message.create({
      conversationId,
      content,
      role,
      agent,
      images,
      artifacts
    })

    return res.status(200).json(message)
  } catch (error) {
    console.error("save message error", error)
    return res.status(500).json({ message: "failed to save message" })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ message: "invalid conversation id" })
    }

    const conversation = await Conversation.exists({
      _id: conversationId,
      userId: req.userId
    })

    if (!conversation) {
      return res.status(404).json({ message: "conversation not found" })
    }

    const messages = await Message.find({ conversationId })

    return res.status(200).json(messages)
  } catch (error) {
    console.error("get messages error", error)
    return res.status(500).json({ message: "failed to get messages" })
  }
}

export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "invalid conversation id" })
    }

    const conversation = await Conversation.findOne({
      _id: id,
      userId: req.userId
    })

    if (!conversation) {
      return res.status(404).json({ message: "conversation not found" })
    }

    await Message.deleteMany({ conversationId: id })
    await Conversation.findOneAndDelete({
      _id: id,
      userId: req.userId
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error("delete conversation error", error)
    return res.status(500).json({ message: "failed to delete conversation" })
  }
}

export const verifyConversation = async (req, res) => {
  try {
    const { conversationId } = req.params

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ message: "invalid conversation id" })
    }

    const conversation = await Conversation.exists({
      _id: conversationId,
      userId: req.userId
    })

    if (!conversation) {
      return res.status(404).json({ message: "conversation not found" })
    }

    return res.status(200).json({ exists: true })
  } catch (error) {
    console.error("verify conversation error", error)
    return res.status(500).json({ message: "failed to verify conversation" })
  }
}

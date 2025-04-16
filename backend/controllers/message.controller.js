import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { to, text } = req.body;
    const from = req.user._id;

    if (!to || !text) {
      return res.status(400).json({ error: "Recipient and message text required" });
    }

    const newMsg = await Message.create({ from, to, text });
    res.status(201).json(newMsg);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ from: userId }, { to: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("from", "-password")
      .populate("to", "-password");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const approveChat = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message || message.to.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to approve this chat" });
    }

    message.approved = true;
    await message.save();

    res.status(200).json({ message: "Chat approved", data: message });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

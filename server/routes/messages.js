import express from 'express'
import Message from "../models/Message.js"
import Conversation from '../models/Conversation.js';
import { verifyToken } from '../middleware/auth.js'

const router = express.Router();
//add

router.post("/", verifyToken, async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

router.get("/:conversationId", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Mark message as read
router.put('/markAsRead', verifyToken, async (req, res) => {
  const { messageId, userId, conversationId } = req.body;

  try {
    // Update the message to add the userId to the readBy array
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { readBy: userId }, // addToSet ensures no duplicates
    });

    // Update the lastRead time for the user in the conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`lastRead.${userId}`]: new Date() },
    });

    res.status(200).json('Message marked as read');
  } catch (err) {
    res.status(500).json(err);
  }
});

// Fetch unread messages for a user
router.get('/unread/:conversationId/:userId', verifyToken, async (req, res) => {
  const { conversationId, userId } = req.params;

  try {
    const unreadMessages = await Message.find({
      conversationId: conversationId,
      readBy: { $ne: userId }, // $ne: not equal
    });

    res.status(200).json(unreadMessages);
  } catch (err) {
    res.status(500).json(err);
  }
  
});

// Fetch if a user has any unread messages in all the conversations they are a member of
router.get('/isUnreadMessages/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params; // Extract the user ID from the verified token

  try {
    // Find all conversations the user is part of
    const conversations = await Conversation.find({
      members: { $in: [userId] },
    });

    if (!conversations.length) {
      return res.status(200).json({ hasUnreadMessages: false });
    }

    // Check for unread messages in each conversation
    for (const conversation of conversations) {
      const lastRead = conversation.lastRead?.get(userId) || new Date(0); // Default to epoch if no lastRead
      const hasUnread = await Message.exists({
        conversationId: conversation._id,
        createdAt: { $gt: lastRead }, // Messages created after the last read time
        readBy: { $ne: userId }, // Ensure the user hasn't read these messages
      });

      if (hasUnread) {
        return res.status(200).json({ hasUnreadMessages: true });
      }
    }

    // No unread messages in any conversation
    res.status(200).json({ hasUnreadMessages: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
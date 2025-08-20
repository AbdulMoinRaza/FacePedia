import Conversation from '../models/Conversation.js'
import express from 'express';
import { verifyToken } from '../middleware/auth.js'


const router = express.Router();

//new conv

router.post("/", verifyToken,async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get conv of a user

router.get("/:userId", verifyToken,async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conv includes two userId

router.get("/find/:firstUserId/:secondUserId", verifyToken, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
      $expr: { $eq: [{ $size: "$members" }, 2] }
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});


// Create a new group conversation
router.post("/group", verifyToken, async (req, res) => {
  const { members: memberIds } = req.body; // Extract 'members' from the request body
  const { more: moreInfo } = req.body;
  console.log('Member IDs:', memberIds);

  // Check if memberIds is an array and has at least two members
  if (!Array.isArray(memberIds) || memberIds.length < 2) {
    return res.status(400).json({ message: "A group must have at least two members." });
  }

  const newGroupConversation = new Conversation({
    members: memberIds,
    more: moreInfo
  });

  try {
    const savedGroupConversation = await newGroupConversation.save();
    res.status(200).json(savedGroupConversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;
import express from 'express';
import {
  getUser,
  getAllUsers,
  getUserFriends,
  addRemoveFriend,
  updateUser,
  addNotification,
  markNotificationAsSeen,
  getNotifications,
  deleteNotifications,
  getSuggestions,
} from "../controllers/users.js";
import { verifyToken } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

// File Upload Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// READ
router.get('/search', verifyToken, getSuggestions);
router.get('/reveal_all_users', verifyToken, getAllUsers);
router.get('/:id', verifyToken, getUser);
router.get('/:id/friends', verifyToken, getUserFriends);

// Notifications
router.post('/:userId/notifications', verifyToken, addNotification);
router.post('/:userId/notifications/:notificationId/seen', verifyToken, markNotificationAsSeen);
router.get('/:userId/notifications', verifyToken, getNotifications);
router.delete('/:userId/notifications', verifyToken, deleteNotifications);

// UPDATE
router.patch('/:id/:friendId', verifyToken, addRemoveFriend);
router.patch('/:id', verifyToken, upload.single('picture'), updateUser); // ✅ Fixed

export default router;

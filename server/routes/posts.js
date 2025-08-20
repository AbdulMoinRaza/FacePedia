import express from 'express'
import {getFeedPosts,getPost , getUserPosts, likePost, deletePost, addTagsToPost, removeTagsFromPost, markPostAsSeen, getTagsForPost, getSeenByForPost} from '../controllers/posts.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router();

//READ
router.get("/",verifyToken, getFeedPosts)
router.get("/:postId",verifyToken, getPost)
router.get("/:userId/posts",verifyToken, getUserPosts)
router.get("/:postId/tags",verifyToken, getTagsForPost)
router.get("/:postId/seen",verifyToken, getSeenByForPost)

//UPDATE
router.patch("/:id/like",verifyToken, likePost)
router.post(":postId/tags",verifyToken, addTagsToPost)
router.delete(":postId/tags",verifyToken, removeTagsFromPost);
router.post(":postId/seen",verifyToken, markPostAsSeen)

//DELETE
router.delete("/:id",verifyToken, deletePost);




export default router;


import express from 'express';
import { getPosts, createPost, deletePost, toggleLike, addComment } from '../controllers/communityController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/posts', getPosts); // unprotected
router.post('/posts', protect, upload.array('media', 5), createPost);
router.delete('/posts/:id', protect, deletePost);
router.post('/posts/:id/like', protect, toggleLike);
router.post('/posts/:id/comment', protect, addComment);

export default router;

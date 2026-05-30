import express from 'express';
import { getStats, getUsers, deleteUser, getPosts, deletePost } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.use(protectAdmin); // Apply middleware to ALL /api/admin routes

router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/posts', getPosts);
router.delete('/posts/:id', deletePost);

export default router;

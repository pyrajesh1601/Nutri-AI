import express from 'express';
import { sendMessage, getHistory, clearHistory } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/message', protect, sendMessage);
router.get('/history', protect, getHistory);
router.delete('/history', protect, clearHistory);

export default router;

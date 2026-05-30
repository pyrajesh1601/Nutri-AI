import express from 'express';
import { createOrUpdateProfile, getProfile, generateReport, getReport } from '../controllers/healthController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/profile', protect, createOrUpdateProfile);
router.get('/profile', protect, getProfile);
router.post('/report/generate', protect, generateReport);
router.get('/report', protect, getReport);

export default router;

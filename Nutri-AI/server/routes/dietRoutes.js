import express from 'express';
import { 
  generateAndSaveMealPlan, 
  getCurrentWeeklyPlan, 
  getDietLogHistory,
  logDailyMeal,
  getTodayStats,
  getWeeklyStats,
  parseMealDescriptionController
} from '../controllers/dietController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/meal-plan/generate', protect, generateAndSaveMealPlan);
router.get('/meal-plan', protect, getCurrentWeeklyPlan);
router.get('/log', protect, getDietLogHistory);

// New Daily Tracking Routes
router.post('/log/daily', protect, logDailyMeal);
router.get('/log/today', protect, getTodayStats);
router.get('/log/weekly', protect, getWeeklyStats);
router.post('/log/parse', protect, parseMealDescriptionController);

export default router;

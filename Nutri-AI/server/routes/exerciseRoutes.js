import express from 'express';
import { 
  getAllExercises, 
  getExerciseById, 
  logWorkout, 
  getWorkoutHistory 
} from '../controllers/exerciseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllExercises);
router.get('/log/history', protect, getWorkoutHistory);
router.post('/log', protect, logWorkout);
router.get('/:id', getExerciseById);

export default router;

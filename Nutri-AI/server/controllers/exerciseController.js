import Exercise from '../models/Exercise.js';
import WorkoutLog from '../models/WorkoutLog.js';

export const getAllExercises = async (req, res) => {
  try {
    const { search, type, difficulty, muscleGroup } = req.query;
    
    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (muscleGroup) query.muscleGroup = muscleGroup;
    
    const exercises = await Exercise.find(query);
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    res.status(200).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logWorkout = async (req, res) => {
  try {
    const { exerciseId, date, duration, caloriesBurned, notes } = req.body;
    
    if (!exerciseId || !duration || !caloriesBurned) {
      return res.status(400).json({ message: 'Please provide exerciseId, duration, and caloriesBurned' });
    }
    
    const log = await WorkoutLog.create({
      userId: req.user._id,
      exerciseId,
      date: date || Date.now(),
      duration,
      caloriesBurned,
      notes
    });
    
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkoutHistory = async (req, res) => {
  try {
    const history = await WorkoutLog.find({ userId: req.user._id })
      .populate('exerciseId', 'name type')
      .sort({ date: -1 });
    
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Exercise from './models/Exercise.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const exercises = [
  {
    name: 'Running',
    type: 'cardio',
    muscleGroup: 'Legs, Full Body',
    difficulty: 'beginner',
    duration: 30,
    caloriesBurned: 300,
    description: 'Steady state running on treadmill or outdoors.',
  },
  {
    name: 'Cycling',
    type: 'cardio',
    muscleGroup: 'Legs',
    difficulty: 'beginner',
    duration: 45,
    caloriesBurned: 400,
    description: 'Moderate intensity cycling.',
  },
  {
    name: 'Barbell Squat',
    type: 'strength',
    muscleGroup: 'Legs, Glutes',
    difficulty: 'intermediate',
    duration: 20,
    caloriesBurned: 150,
    description: 'Traditional barbell back squat.',
  },
  {
    name: 'Bench Press',
    type: 'strength',
    muscleGroup: 'Chest, Triceps',
    difficulty: 'intermediate',
    duration: 20,
    caloriesBurned: 100,
    description: 'Barbell bench press on a flat bench.',
  },
  {
    name: 'Deadlift',
    type: 'strength',
    muscleGroup: 'Back, Legs',
    difficulty: 'advanced',
    duration: 25,
    caloriesBurned: 200,
    description: 'Conventional barbell deadlift.',
  },
  {
    name: 'Vinyasa Yoga',
    type: 'yoga',
    muscleGroup: 'Full Body, Core',
    difficulty: 'intermediate',
    duration: 60,
    caloriesBurned: 250,
    description: 'Flowing yoga sequence linking breath with movement.',
  },
  {
    name: 'Hatha Yoga',
    type: 'yoga',
    muscleGroup: 'Full Body',
    difficulty: 'beginner',
    duration: 45,
    caloriesBurned: 150,
    description: 'Gentle, foundational yoga practice.',
  },
  {
    name: 'Burpees HIIT',
    type: 'hiit',
    muscleGroup: 'Full Body',
    difficulty: 'advanced',
    duration: 15,
    caloriesBurned: 250,
    description: 'High intensity interval training focusing on burpees.',
  },
  {
    name: 'Mountain Climbers HIIT',
    type: 'hiit',
    muscleGroup: 'Core, Shoulders',
    difficulty: 'intermediate',
    duration: 20,
    caloriesBurned: 200,
    description: 'Intense mountain climbers with short rest periods.',
  },
  {
    name: 'Hamstring Stretch',
    type: 'flexibility',
    muscleGroup: 'Hamstrings',
    difficulty: 'beginner',
    duration: 10,
    caloriesBurned: 30,
    description: 'Static seated or standing hamstring stretch.',
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');
    
    await Exercise.deleteMany(); // Clear existing
    console.log('Cleared existing exercises');

    await Exercise.insertMany(exercises);
    console.log('10 Exercises successfully seeded');

    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();

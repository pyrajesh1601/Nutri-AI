import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['cardio', 'strength', 'yoga', 'hiit', 'flexibility'], 
    required: true 
  },
  muscleGroup: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    required: true 
  },
  duration: { type: Number, required: true }, // in mins
  caloriesBurned: { type: Number, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String },
  thumbnail: { type: String }
}, { timestamps: true });

const Exercise = mongoose.model('Exercise', exerciseSchema);
export default Exercise;

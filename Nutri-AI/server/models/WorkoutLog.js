import mongoose from 'mongoose';

const workoutLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  date: { type: Date, default: Date.now },
  duration: { type: Number, required: true }, // actual duration user exercised
  caloriesBurned: { type: Number, required: true }, // actual calories burned
  notes: { type: String }
}, { timestamps: true });

workoutLogSchema.index({ userId: 1 });
workoutLogSchema.index({ date: -1 });

const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);
export default WorkoutLog;

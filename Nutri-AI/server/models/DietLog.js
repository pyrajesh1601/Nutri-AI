import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  mealType: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snack'], 
    required: true 
  },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  estimatedCost: { type: Number, required: true }
});

const daySchema = new mongoose.Schema({
  day: { type: String, required: true },
  meals: [mealSchema]
});

const dietLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  weeklyBudget: { type: Number, required: true },
  days: [daySchema],
  totalCalories: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  generatedByAI: { type: Boolean, default: false }
}, { timestamps: true });

dietLogSchema.index({ userId: 1 });
dietLogSchema.index({ date: -1 });

const DietLog = mongoose.model('DietLog', dietLogSchema);
export default DietLog;

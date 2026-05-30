import mongoose from 'mongoose';

const healthProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    weight: { type: Number, required: true }, // in kg
    height: { type: Number, required: true }, // in cm
    activityLevel: { 
      type: String, 
      enum: ['sedentary', 'lightly active', 'moderately active', 'very active', 'super active'], 
      required: true 
    },
    goal: { 
      type: String, 
      enum: ['lose', 'maintain', 'gain'], 
      required: true 
    },
    dietaryPreference: {
      type: String,
      enum: ['pure_veg', 'mixed', 'non_veg'],
      required: true,
      default: 'mixed'
    },
    weeklyBudget: { type: Number, required: true }, // in INR
    bmi: { type: Number },
    dailyCalorieNeeds: { type: Number },
    targetCalories: { type: Number },
    dailyBurnGoal: { type: Number, default: 500 },
  },
  {
    timestamps: true,
  }
);

const HealthProfile = mongoose.model('HealthProfile', healthProfileSchema);
export default HealthProfile;

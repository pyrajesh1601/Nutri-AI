import mongoose from 'mongoose';

const aiHealthReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bmi: { type: Number, required: true },
    bmiCategory: { type: String, required: true },
    dailyCalories: { type: Number, required: true },
    macros: {
      protein: { type: Number, required: true }, // in grams
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
    },
    wellnessRecommendations: [{ type: String }],
    heartHealthInsights: [{ type: String }],
    riskWarnings: [{ type: String }],
    generatedAt: { type: Date, default: Date.now },
  }
);

const AIHealthReport = mongoose.model('AIHealthReport', aiHealthReportSchema);
export default AIHealthReport;

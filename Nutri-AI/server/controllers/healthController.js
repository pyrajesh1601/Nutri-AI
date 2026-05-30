import HealthProfile from '../models/HealthProfile.js';
import AIHealthReport from '../models/AIHealthReport.js';
import { generateHealthReport } from '../utils/aiService.js';

// Calculate BMI
const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  return +(weight / (heightInMeters * heightInMeters)).toFixed(2);
};

export const createOrUpdateProfile = async (req, res) => {
  try {
    const { age, gender, weight, height, activityLevel, goal, weeklyBudget, dietaryPreference, targetCalories, dailyBurnGoal } = req.body;

    if (!age || !gender || !weight || !height || !activityLevel || !goal || !weeklyBudget || !dietaryPreference) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const bmi = calculateBMI(weight, height);
    
    // Simplistic daily calorie needs for placeholder, will rely on AI mostly
    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else if (gender === 'female') {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age); // fallback
    }
    const dailyCalorieNeeds = Math.round(bmr * 1.5); // generic multiplier

    const profileData = {
      userId: req.user._id,
      age,
      gender,
      weight,
      height,
      activityLevel,
      goal,
      dietaryPreference,
      weeklyBudget,
      bmi,
      dailyCalorieNeeds,
      targetCalories,
      dailyBurnGoal,
    };

    let profile = await HealthProfile.findOne({ userId: req.user._id });

    if (profile) {
      profile = await HealthProfile.findOneAndUpdate(
        { userId: req.user._id },
        profileData,
        { returnDocument: 'after' }
      );
    } else {
      profile = await HealthProfile.create(profileData);
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await HealthProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Health profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateReport = async (req, res) => {
  try {
    const profile = await HealthProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({ message: 'Please create a health profile first' });
    }

    const reportJson = await generateHealthReport(profile);

    const reportData = {
      userId: req.user._id,
      bmi: reportJson.bmi,
      bmiCategory: reportJson.bmiCategory,
      dailyCalories: reportJson.dailyCalories,
      macros: reportJson.macros,
      wellnessRecommendations: reportJson.wellnessRecommendations,
      heartHealthInsights: reportJson.heartHealthInsights || [],
      riskWarnings: reportJson.riskWarnings || [],
    };

    // Replace old report if exists, or just create new
    await AIHealthReport.findOneAndDelete({ userId: req.user._id });
    const newReport = await AIHealthReport.create(reportData);

    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReport = async (req, res) => {
  try {
    const report = await AIHealthReport.findOne({ userId: req.user._id });
    if (!report) {
      return res.status(404).json({ message: 'AI Health report not found' });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

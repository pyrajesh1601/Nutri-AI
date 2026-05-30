import DietLog from '../models/DietLog.js';
import DailyMealLog from '../models/DailyMealLog.js';
import HealthProfile from '../models/HealthProfile.js';
import { generateMealPlan, parseMealDescription } from '../utils/dietAiService.js';

export const generateAndSaveMealPlan = async (req, res) => {
  try {
    console.log('User ID:', req.user._id);
    
    const healthProfile = await HealthProfile.findOne({ 
      userId: req.user._id 
    });
    
    console.log('Health Profile Found:', healthProfile ? 'YES' : 'NO');
    
    if (!healthProfile) {
      return res.status(400).json({ 
        success: false,
        message: "Please complete your health profile first." 
      });
    }

    console.log('Weekly Budget from Profile:', healthProfile?.weeklyBudget);

    const budget = req.body?.weeklyBudget || 
                   healthProfile?.weeklyBudget || 
                   2000;

    console.log('Final Budget to use:', budget);

    const mealPlanJson = await generateMealPlan(healthProfile, budget);

    console.log('Meal plan generated:', mealPlanJson ? 'YES' : 'NO');

    if (!mealPlanJson) {
      throw new Error('Meal plan generation returned empty result');
    }

    const mealPlanData = {
      userId: req.user._id,
      date: new Date(),
      weeklyBudget: mealPlanJson.weeklyBudget || budget,
      days: mealPlanJson.days || [],
      totalCalories: mealPlanJson.totalCalories || 2000,
      totalCost: mealPlanJson.totalCost || budget,
      generatedByAI: true
    };

    const newMealPlan = await DietLog.create(mealPlanData);
    res.status(201).json(newMealPlan);

  } catch (error) {
    console.error('Diet generation error FULL:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const getCurrentWeeklyPlan = async (req, res) => {
  try {
    // Fetch the most recent generated plan for the user
    const mealPlan = await DietLog.findOne({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    if (!mealPlan) {
      return res.status(404).json({ message: 'No weekly meal plan found. Please generate one.' });
    }

    res.status(200).json(mealPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDietLogHistory = async (req, res) => {
  try {
    const history = await DietLog.find({ userId: req.user._id }).sort({ date: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Daily Meal Logging
export const logDailyMeal = async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat, mealType } = req.body;
    
    const meal = await DailyMealLog.create({
      userId: req.user._id,
      name,
      calories,
      protein,
      carbs,
      fat,
      mealType
    });
    
    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTodayStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const meals = await DailyMealLog.find({
      userId: req.user._id,
      date: { $gte: startOfDay }
    });
    
    const totals = meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    res.status(200).json({ totals, meals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeeklyStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const meals = await DailyMealLog.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo }
    });
    
    // Group by day for weekly chart/progress
    const grouped = meals.reduce((acc, meal) => {
      const date = meal.date.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + meal.calories;
      return acc;
    }, {});
    
    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const parseMealDescriptionController = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    
    const analysis = await parseMealDescription(description);
    res.status(200).json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Groq from 'groq-sdk';

let groq;
const getGroq = () => {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

export const generateMealPlan = async (healthProfile, weeklyBudget) => {
  
  console.log('generateMealPlan called with:', 
    JSON.stringify(healthProfile), weeklyBudget);

  if (!healthProfile) {
    throw new Error('Health profile is required to generate meal plan');
  }

  const age = healthProfile.age || 25;
  const gender = healthProfile.gender || 'other';
  const weight = healthProfile.weight || 70;
  const height = healthProfile.height || 170;
  const activityLevel = healthProfile.activityLevel || 'moderately active';
  const goal = healthProfile.goal || 'maintain';
  const targetCalories = healthProfile.dailyCalorieNeeds ? healthProfile.dailyCalorieNeeds * 7 : 14000;
  const budget = weeklyBudget || healthProfile.weeklyBudget || 2000;

  const dietaryRules = {
    pure_veg: `STRICT RULE: Generate ONLY 100% vegetarian meals. 
      No meat, no fish, no eggs. 
      Use: dal, paneer, tofu, legumes, vegetables, 
      fruits, dairy, nuts, seeds.`,
    mixed: `Generate a balanced mix of vegetarian and 
      non-vegetarian meals throughout the week.
      Include both plant-based and lean meat options.`,
    non_veg: `Include non-vegetarian options like 
      chicken, fish, eggs throughout the week.
      Balance with vegetables and whole grains.`
  };

  const prompt = `Generate a full-week meal plan (7 days, 3 meals per day) based on:
- Age: ${age}
- Gender: ${gender}
- Weight: ${weight} kg
- Height: ${height} cm
- Activity Level: ${activityLevel}
- Goal: ${goal}
- Target Weekly Calories: ${targetCalories}
- Weekly Budget: ${budget} INR
- Dietary Preference: ${healthProfile.dietaryPreference || 'mixed'}
- Dietary Rules: ${dietaryRules[healthProfile.dietaryPreference || 'mixed']}

Respond ONLY with valid JSON in exactly this format, no extra text:
{
  "weeklyBudget": ${budget},
  "totalCalories": ${targetCalories},
  "totalCost": 1800,
  "days": [
    {
      "day": "Monday",
      "meals": [
        {
          "mealType": "breakfast",
          "name": "Oatmeal with fruits",
          "calories": 400,
          "protein": 15,
          "carbs": 60,
          "fat": 10,
          "estimatedCost": 80
        }
      ]
    }
  ]
}`;

  try {
    console.log('Calling Groq API with key:', 
      process.env.GROQ_API_KEY ? 'KEY EXISTS' : 'KEY MISSING');

    const client = getGroq();
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    });

    console.log('Groq responded successfully');

    const rawText = response.choices[0].message.content;
    console.log('Raw response:', rawText);

    const cleanText = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    if (!result.days || !Array.isArray(result.days)) {
      throw new Error('Invalid meal structure in AI response (missing days array)');
    }

    result.weeklyBudget = result.weeklyBudget || budget;
    result.totalCalories = result.totalCalories || targetCalories;
    result.totalCost = result.totalCost || budget;

    console.log('Meal plan generated successfully');
    return result;

  } catch (error) {
    console.error('Groq API Error:', error.message);
    throw new Error('Failed to generate meal plan: ' + error.message);
  }
};

export const parseMealDescription = async (description) => {
  if (!description) throw new Error('Meal description is required');

  const prompt = `Act as a nutrition expert. Parse this meal description and return only the estimated calories, protein, carbs, and fat in grams.
Meal: "${description}"

Respond ONLY with valid JSON in this format:
{
  "name": "A concise name for the meal",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0
}
If you're unsure, provide a reasonable estimate for a single serving of that meal. Do not include any extra text.`;

  try {
    const client = getGroq();
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1
    });

    const rawText = response.choices[0].message.content;
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON found');
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Meal Parsing Error:', error.message);
    throw new Error('AI was unable to estimate that meal. Try being more specific.');
  }
};

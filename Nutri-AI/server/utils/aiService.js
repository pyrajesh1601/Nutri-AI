import Groq from 'groq-sdk';

let groq;
const getGroq = () => {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

export const generateHealthReport = async (healthProfileData) => {
  const prompt = `
  Based on the following user health profile, generate a comprehensive health report.
  Profile:
  - Age: ${healthProfileData.age}
  - Gender: ${healthProfileData.gender}
  - Weight: ${healthProfileData.weight} kg
  - Height: ${healthProfileData.height} cm
  - Activity Level: ${healthProfileData.activityLevel}
  - Goal: ${healthProfileData.goal}
  - Weekly Budget: ${healthProfileData?.weeklyBudget || 2000} INR
  - Dietary Preference: ${healthProfileData?.dietaryPreference || 'mixed'}

  Factor in the user's dietary preference when making wellness and nutrition recommendations.
  
  IMPORTANT FOCUS AREAS:
  1. Emphasize Heart Health (Cardiovascular wellness). Explain why a healthy heart is the foundation of longevity.
  2. Discuss the risks of improper heavy weight lifting or gymming without form guidance.
  3. Provide holistic tips that integrate cardio, strength, and recovery.

  Please respond ONLY with a JSON object in exactly this format:
  {
    "bmi": 24.5,
    "bmiCategory": "Normal Weight",
    "dailyCalories": 2200,
    "macros": {
      "protein": 150,
      "carbs": 250,
      "fat": 65
    },
    "wellnessRecommendations": ["rec1", "rec2", "rec3", "rec4", "rec5"],
    "heartHealthInsights": [
      "Detail about cardio importance",
      "Specific heart-healthy food/habit",
      "Metric to track for heart health"
    ],
    "riskWarnings": [
      "Warning about heavy lifting form",
      "Warning about overtraining/recovery"
    ]
  }
  Do not include any text outside of the JSON object.
  `;

  try {
    const client = getGroq();
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }]
    });

    const reportText = response.choices[0].message.content;
    const jsonMatch = reportText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
       throw new Error("Could not parse JSON from response");
    }
    const reportJson = JSON.parse(jsonMatch[0]);
    return reportJson;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    throw new Error('Failed to generate health report from AI');
  }
};

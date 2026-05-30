import Groq from 'groq-sdk';

let groq;
const getGroq = () => {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

export const generateChatResponse = async (userMessage, healthProfile, chatHistory) => {
  const systemInstruction = `You are a friendly, motivating AI nutrition and fitness coach named NutriBot. Keep responses concise, positive, and actionable. Always reference the user's HealthProfile data when relevant.
  User Profile:
  - Age: ${healthProfile?.age || 'N/A'}
  - Gender: ${healthProfile?.gender || 'N/A'}
  - Weight: ${healthProfile?.weight || 'N/A'} kg
  - Height: ${healthProfile?.height || 'N/A'} cm
  - Activity Level: ${healthProfile?.activityLevel || 'N/A'}
  - Goal: ${healthProfile?.goal || 'N/A'}`;

  const messages = [
    { role: "system", content: systemInstruction },
    ...chatHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.message
    })),
    { role: "user", content: userMessage }
  ];

  try {
    const client = getGroq();
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error('Failed to generate chat response');
  }
};

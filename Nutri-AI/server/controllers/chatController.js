import ChatMessage from '../models/ChatMessage.js';
import HealthProfile from '../models/HealthProfile.js';
import { generateChatResponse } from '../utils/chatAiService.js';

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    // Save user message
    const userMsg = await ChatMessage.create({
      userId: req.user._id,
      role: 'user',
      message
    });

    const profile = await HealthProfile.findOne({ userId: req.user._id });
    
    // Get history (limit to last 20 for context)
    const history = await ChatMessage.find({ userId: req.user._id })
      .sort({ timestamp: 1 })
      .limit(20);
    
    const historyWithoutLast = history.filter(m => m._id.toString() !== userMsg._id.toString());

    const aiResponseText = await generateChatResponse(message, profile || {}, historyWithoutLast);

    const aiMsg = await ChatMessage.create({
      userId: req.user._id,
      role: 'assistant',
      message: aiResponseText
    });

    res.status(200).json(aiMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await ChatMessage.find({ userId: req.user._id }).sort({ timestamp: 1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ userId: req.user._id });
    res.status(200).json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

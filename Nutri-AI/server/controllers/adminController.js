import User from '../models/User.js';
import CommunityPost from '../models/CommunityPost.js';
import WorkoutLog from '../models/WorkoutLog.js';
import ChatMessage from '../models/ChatMessage.js';
import DietLog from '../models/DietLog.js';
import Notification from '../models/Notification.js';

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await CommunityPost.countDocuments();
    const totalWorkoutLogs = await WorkoutLog.countDocuments();
    const totalChatMessages = await ChatMessage.countDocuments();
    const totalMealPlans = await DietLog.countDocuments();

    res.status(200).json({
      totalUsers,
      totalPosts,
      totalWorkoutLogs,
      totalChatMessages,
      totalMealPlans
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Cascade delete associated data
    await CommunityPost.deleteMany({ userId: user._id });
    await WorkoutLog.deleteMany({ userId: user._id });
    await ChatMessage.deleteMany({ userId: user._id });
    await DietLog.deleteMany({ userId: user._id });
    await Notification.deleteMany({ userId: user._id });
    
    await user.deleteOne();
    
    res.status(200).json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await CommunityPost.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted by admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

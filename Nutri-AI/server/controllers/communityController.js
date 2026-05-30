import CommunityPost from '../models/CommunityPost.js';
import Notification from '../models/Notification.js';
import { getIo } from '../socket/index.js';

export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await CommunityPost.find()
      .populate('userId', 'name avatar')
      .populate('comments.userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    let mediaUrls = [];
    let mediaType = 'none';

    if (req.files && req.files.length > 0) {
      mediaUrls = req.files.map(file => file.path);
      if (mediaUrls[0].match(/\.(mp4|mov)$/i)) {
        mediaType = 'video';
      } else {
        mediaType = 'image';
      }
    }

    const post = await CommunityPost.create({
      userId: req.user._id,
      content,
      mediaUrls,
      mediaType
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
      
      // Notify post owner
      if (post.userId.toString() !== req.user._id.toString()) {
        const notif = await Notification.create({
          userId: post.userId,
          type: 'like',
          message: `${req.user.name} liked your post`
        });
        
        getIo().to(post.userId.toString()).emit('newNotification', notif);
      }
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      userId: req.user._id,
      text
    };

    post.comments.push(comment);
    await post.save();

    // Notify post owner
    if (post.userId.toString() !== req.user._id.toString()) {
      const notif = await Notification.create({
        userId: post.userId,
        type: 'comment',
        message: `${req.user.name} commented on your post`
      });
      
      getIo().to(post.userId.toString()).emit('newNotification', notif);
    }

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

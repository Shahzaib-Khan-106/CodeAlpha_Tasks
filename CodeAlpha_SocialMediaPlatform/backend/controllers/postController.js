import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// ✅ Create a new post and notify followers in real-time
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id; // ✅ from JWT

    const post = await Post.create({ user: userId, content });

    // Notify followers in real-time
    const user = await User.findById(userId).populate('followers');
    if (user && user.followers) {
      const io = req.app.get('io');
      user.followers.forEach(follower => {
        io.to(follower._id.toString()).emit('newPost', {
          user: user.username,
          content: post.content,
          postId: post._id
        });
      });
    }

    res.json({ message: "Post created successfully", post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username')
      .populate('comments.user', 'username');
    res.json(posts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Like a post and notify the owner
export const likePost = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from JWT
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!post.user) return res.status(400).json({ error: "Post has no user assigned" });

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();

      await Notification.create({
        recipient: post.user, // ✅ pass ObjectId directly
        sender: userId,
        type: 'like',
        post: post._id
      });

      const io = req.app.get('io');
      io.to(post.user.toString()).emit('notification', {
        sender: userId,
        type: 'like',
        post: post._id
      });
    }

    res.json({ message: "Post liked successfully", post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Comment on a post and notify the owner
export const commentPost = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from JWT
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!post.user) return res.status(400).json({ error: "Post has no user assigned" });

    post.comments.push({ user: userId, text });
    await post.save();

    await Notification.create({
      recipient: post.user, // ✅ pass ObjectId directly
      sender: userId,
      type: 'comment',
      post: post._id
    });

    const io = req.app.get('io');
    io.to(post.user.toString()).emit('notification', {
      sender: userId,
      type: 'comment',
      post: post._id
    });

    res.json({ message: "Comment added successfully", post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get feed (posts from followed users)
export const getFeed = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ user: { $in: user.following } })
      .populate('user', 'username')
      .populate('comments.user', 'username');

    res.json(posts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

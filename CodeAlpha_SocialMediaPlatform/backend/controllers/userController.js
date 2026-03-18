import User from '../models/User.js';
import Post from '../models/Post.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = "yourSecretKey"; // ⚠️ Move to environment variable in production

// ✅ Register User
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Login User (returns JWT)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get Profile (with followers, following, and posts)
export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate('followers', 'username email')
      .populate('following', 'username email');

    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ user: id })
      .populate('comments.user', 'username');

    res.json({
      user: {
        username: user.username,
        email: user.email,
        followers: user.followers,
        following: user.following
      },
      posts
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Follow User
export const followUser = async (req, res) => {
  try {
    const { userId, targetId } = req.body;
    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!user || !target) return res.status(404).json({ message: "User not found" });

    if (!user.following.includes(targetId)) {
      user.following.push(targetId);
      target.followers.push(userId);
      await user.save();
      await target.save();
    }

    res.json({ message: "Followed successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Unfollow User
export const unfollowUser = async (req, res) => {
  try {
    const { userId, targetId } = req.body;
    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!user || !target) return res.status(404).json({ message: "User not found" });

    user.following = user.following.filter(f => f.toString() !== targetId);
    target.followers = target.followers.filter(f => f.toString() !== userId);

    await user.save();
    await target.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

import Notification from '../models/Notification.js';

// ✅ Get notifications for the logged-in user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username')
      .populate('post', 'content')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

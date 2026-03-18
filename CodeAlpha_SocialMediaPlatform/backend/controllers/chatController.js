import Chat from '../models/Chat.js';

// ✅ Send a new chat message
export const sendMessage = async (req, res) => {
  try {
    const { sender, recipient, message } = req.body;
    const chat = await Chat.create({ sender, recipient, message });

    // Emit real-time message to recipient
    const io = req.app.get('io');
    io.to(recipient.toString()).emit('chatMessage', {
      sender,
      message,
      createdAt: chat.createdAt
    });

    res.json(chat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get chat history between two users
export const getMessages = async (req, res) => {
  try {
    const { userId, contactId } = req.params;
    const messages = await Chat.find({
      $or: [
        { sender: userId, recipient: contactId },
        { sender: contactId, recipient: userId }
      ]
    })
    .populate('sender', 'username')
    .populate('recipient', 'username')
    .sort({ createdAt: 1 }); // oldest → newest

    res.json(messages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

import express from 'express';
import { sendMessage, getMessages } from '../controllers/chatController.js';

const router = express.Router();

// ✅ Send a new chat message
router.post('/send', sendMessage);

// ✅ Get chat history between two users
router.get('/:userId/:contactId', getMessages);

export default router;

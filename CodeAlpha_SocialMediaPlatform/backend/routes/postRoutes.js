import express from 'express';
import {
  createPost,
  getPosts,
  likePost,
  commentPost,
  getFeed
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createPost);
router.get('/', protect, getPosts);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentPost);
router.get('/feed/:userId', protect, getFeed);

export default router;

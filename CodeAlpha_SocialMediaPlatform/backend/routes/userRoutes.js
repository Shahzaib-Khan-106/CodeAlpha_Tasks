import express from "express";
import { registerUser, loginUser, getProfile, followUser, unfollowUser } from "../controllers/userController.js";

const router = express.Router();

// Register & Login
router.post("/register", registerUser);
router.post("/login", loginUser);

// Profile
router.get("/:id/profile", getProfile);

// Follow / Unfollow
router.post("/follow", followUser);
router.post("/unfollow", unfollowUser);

export default router;

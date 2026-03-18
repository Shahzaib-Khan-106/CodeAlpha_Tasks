import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true // ✅ ensures every post has a user
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        text: {
          type: String,
          required: true,
          trim: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);

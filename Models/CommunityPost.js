const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  authorName: String,
  role: {
    type: String,
    default: "Student"
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    authorName: String,
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isSuccessStory: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("CommunityPost", communityPostSchema);

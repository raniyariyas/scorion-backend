const CommunityPost = require("../Models/CommunityPost");
const User = require("../Models/User");

exports.createPost = async (req, res) => {
  try {
    const { text, tags, isSuccessStory } = req.body;
    const userId = req.user.id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Insight text is required" });
    }

    if (text.length > 500) {
      return res.status(400).json({ message: "Insight exceeds the 500-character transmission limit" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newPost = await CommunityPost.create({
      author: userId,
      authorName: user.name,
      role: "Student", // Could be dynamic based on user profile
      text,
      tags: tags || ["General"],
      isSuccessStory: isSuccessStory || false
    });

    // Populate the post before sending/emitting
    const populatedPost = await newPost.populate("author", "name");

    // Real-time emit via Socket.IO
    try {
      const { io } = require("../server");
      if (io) {
        io.emit('new-community-post', {
          id: populatedPost._id,
          author: populatedPost.authorName,
          role: populatedPost.role,
          avatar: populatedPost.authorName.charAt(0),
          text: populatedPost.text,
          tags: populatedPost.tags,
          likes: 0,
          replies: 0,
          time: 'Just now',
          isSuccessStory: populatedPost.isSuccessStory
        });
      }
    } catch (socketErr) {
      console.error("Socket emit failed in Community:", socketErr.message);
    }

    res.status(201).json({ message: "Post broadcasted successfully", post: populatedPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during broadcasting" });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedPosts = posts.map(post => ({
      id: post._id,
      author: post.authorName,
      role: post.role,
      avatar: post.authorName ? post.authorName.charAt(0) : 'U',
      text: post.text,
      tags: post.tags,
      likes: post.likes.length,
      replies: post.replies || [],
      time: formatTimeAgo(post.createdAt),
      isSuccessStory: post.isSuccessStory
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to sync with Network" });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await CommunityPost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.status(200).json({ likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: "Like action failed" });
  }
};

exports.replyToPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await CommunityPost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.replies.push({
      author: userId,
      authorName: user.name,
      text: text
    });

    await post.save();
    res.status(200).json({ message: "Reply added", replies: post.replies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Reply failed" });
  }
};

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "m ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "Just now";
}

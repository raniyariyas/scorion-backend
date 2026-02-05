const express = require("express");
const router = express.Router();

const {
   studentregistration,
   verifyOtp,
   studentlogin,
   forgotPassword,
   verifyForgotOtp,
   resetPassword,
   studentCreatePassword,
   getProfile,
   getPersonalMarks
   } = require("../Controllers/studentController");
const communityController = require("../Controllers/communityController");
const syllabusController = require("../Controllers/syllabusController");
const { authUser } = require("../Middleware/authMiddleware");

   
// login ,otpverify,register
router.post('/register',studentregistration);
router.post("/verify-otp",verifyOtp);
router.post("/login", studentlogin);
router.post('/forgot-password',forgotPassword);
router.post("/forgot-password/verify-otp", verifyForgotOtp);
router.post("/reset-password", resetPassword);
router.post("/createpassword/:token", studentCreatePassword);

// Information routes
router.get("/profile", authUser, getProfile);
router.get("/marks", authUser, getPersonalMarks);

// Notification routes
const Notification = require("../Models/Notification");

// Get all notifications for logged-in student
router.get("/notifications", authUser, async (req, res) => {
  try {
    const notifications = await Notification.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get unread notification count
router.get("/notifications/unread-count", authUser, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      student: req.user.id, 
      isRead: false 
    });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark notification as read
router.put("/notifications/:id/read", authUser, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, student: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "Marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark all notifications as read
router.put("/notifications/mark-all-read", authUser, async (req, res) => {
  try {
    await Notification.updateMany(
      { student: req.user.id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Community routes
router.post("/community/posts", authUser, communityController.createPost);
router.get("/community/posts", authUser, communityController.getPosts);
router.put("/community/posts/:id/like", authUser, communityController.likePost);

// Syllabus routes
router.get("/syllabus/:semester", authUser, syllabusController.getSyllabusBySemester);
router.get("/syllabus", authUser, syllabusController.getAllSyllabus);

module.exports = router;

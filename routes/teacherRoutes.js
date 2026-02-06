const express = require("express");
const router = express.Router();
const Notification = require("../Models/Notification");
const {
  teacherRegistration,
  verifyOtp,
  teacherLogin,
  teacherForgotPassword,       //  Add this
  verifyTeacherForgotOtp,      //  Add this
  resetTeacherPassword,          // Add this
  teacherpassword,
  addMark,
  getMarks,
  listMarks,
  searchstudentsteacher,
  updateMarks,
  getTeacherProfile,
  deleteMark,
  getStudentSyllabus,
  saveImprovementNotes,
  getImprovementNotes,
  sendDeptAlert
} = require("../Controllers/teacherController");

const { verifyToken } = require("../Middleware/authMiddleware");
const authTeacher = verifyToken("teacher");
const { searchstudents } = require("../Controllers/adminController");

// Register
router.post("/createpassword/:token", teacherpassword);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Login
router.post("/login", teacherLogin);

//  Forgot Password Routes
router.post("/new-password", resetTeacherPassword);               // Step 3: Reset Password
router.post("/forgot-password", teacherForgotPassword);           // Step 1: Send OTP
router.post("/verify-forgot-otp", verifyTeacherForgotOtp);        // Step 2: Verify OTP

// add student marks
router.post("/add-mark", authTeacher, addMark);
//get student marks
router.get("/marks", authTeacher, listMarks);
router.get("/studentsearch/", authTeacher, searchstudentsteacher);
// Update marks
router.put("/update/:id", authTeacher, updateMarks);

// Get Student Syllabus
router.get("/student-syllabus/:studentId/:semester", authTeacher, getStudentSyllabus);

// Profile
router.get("/profile", authTeacher, getTeacherProfile);

// Delete Mark
router.delete("/delete-mark/:id", authTeacher, deleteMark);

// Improvement Notes
router.post("/students/improvement-notes", authTeacher, saveImprovementNotes);
router.get("/students/improvement-notes", authTeacher, getImprovementNotes);
// Notification routes for teachers
router.get("/notifications", authTeacher, async (req, res) => {
  try {
    const notifications = await Notification.find({ teacher: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/notifications/unread-count", authTeacher, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      teacher: req.user.id, 
      isRead: false 
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Mark notification as read
router.put("/notifications/:id/read", authTeacher, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "Marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Mark all notifications as read
router.put("/notifications/mark-all-read", authTeacher, async (req, res) => {
  try {
    await Notification.updateMany(
      { teacher: req.user.id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/dept-alert", authTeacher, sendDeptAlert);

module.exports = router;

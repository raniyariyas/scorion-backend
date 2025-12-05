const express = require("express");
const router = express.Router();
const {
  teacherRegistration,
  verifyOtp,
  teacherLogin,
  teacherForgotPassword,       // ✅ Add this
  verifyTeacherForgotOtp,      // ✅ Add this
  resetTeacherPassword,          // ✅ Add this
  teacherpassword,
  addMark,
  getMarks,
  listMarks,
  searchstudentsteacher,
  updateMarks
} = require("../Controllers/teacherController");

const authTeacher = require("../Middleware/authMiddleware");
const { searchstudents } = require("../Controllers/adminController");

// Register
router.post("/createpassword/:token", teacherpassword);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Login
router.post("/login", teacherLogin);

// 🔥 Forgot Password Routes
router.post("/new-password", resetTeacherPassword);               // Step 3: Reset Password
router.post("/forgot-password", teacherForgotPassword);           // Step 1: Send OTP
router.post("/verify-forgot-otp", verifyTeacherForgotOtp);        // Step 2: Verify OTP

// add student marks
router.post("/add-mark", addMark);
//get student marks
router.get("/marks", listMarks);
router.get("/studentsearch/",searchstudentsteacher);
// Update marks
router.put("/update/:id",updateMarks);

module.exports = router;

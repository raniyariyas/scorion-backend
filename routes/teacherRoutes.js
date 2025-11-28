const express = require("express");
const router = express.Router();
const {
  teacherRegistration,
  verifyOtp,
  teacherLogin,
  teacherForgotPassword,       // ✅ Add this
  verifyTeacherForgotOtp,      // ✅ Add this
  resetTeacherPassword,          // ✅ Add this
  teacherpassword
} = require("../Controllers/teacherController");

const authTeacher = require("../Middleware/authMiddleware");

// Register
router.post("/createpassword/:token", teacherpassword);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Login
router.post("/login", teacherLogin);

// 🔥 Forgot Password Routes
router.post("/forgot-password", teacherForgotPassword);           // Step 1: Send OTP
router.post("/verify-forgot-otp", verifyTeacherForgotOtp);        // Step 2: Verify OTP
router.post("/new-password", resetTeacherPassword);               // Step 3: Reset Password

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  adminRegistration,
  verifyOtp,
  adminLogin,
  adminForgotPassword,
  verifyAdminForgotOtp,
  resetAdminPassword,
  verifyAdminOtp
} = require("../Controllers/adminController");

// Admin registration
router.post("/register", adminRegistration);

// OTP verification
router.post("/verify-otp", verifyAdminOtp);

// Login
router.post("/login", adminLogin);

// 🔥 Forgot Password Routes
router.post("/forgot-password", adminForgotPassword);           // Send OTP
router.post("/verify-forgot-otp", verifyAdminForgotOtp);        // Verify OTP
router.post("/new-password", resetAdminPassword);               // Reset Password

module.exports = router;

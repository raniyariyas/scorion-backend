const express = require("express");
const { verifyToken } = require("../Middleware/authMiddleware");
const router = express.Router();
const {
  adminRegistration,
  verifyOtp,
  adminLogin,
  adminForgotPassword,
  verifyAdminForgotOtp,
  resetAdminPassword, 
  verifyAdminOtp,
  addTeacher,
  editTeacher,
  listTeachers,
  getTeacher,


} = require("../Controllers/adminController");

// admin auth not given

// Admin registration
router.post("/register", adminRegistration);

// OTP verification
router.post("/verify-otp", verifyAdminOtp);

// Login
router.post("/login", adminLogin);

//  Forgot Password Routes
router.post("/forgot-password", adminForgotPassword);           // Send OTP
router.post("/verify-forgot-otp", verifyAdminForgotOtp);        // Verify OTP
router.post("/new-password", resetAdminPassword);               // Reset Password
router.post("/add-teacher",verifyToken("admin"), addTeacher);
router.put("/edit-teacher/:Id",verifyToken("admin"), editTeacher);
router.get("/teachers",verifyToken("admin") , listTeachers);
router.get("/teacher/:Id",verifyToken("admin") , getTeacher);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  adminRegistration,
  verifyAdminOtp,
  adminLogin
} = require("../Controllers/adminController");

const authUser = require("../Middleware/authMiddleware");

// Admin registration
router.post("/register", adminRegistration);

// Admin OTP verification
router.post("/verify-otp", verifyAdminOtp);

// Admin login
router.post("/login", adminLogin);



module.exports = router;

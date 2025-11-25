const express = require("express");
const router = express.Router();
const {
    teacherRegistration,
  verifyOtp,
  teacherLogin
} = require("../Controllers/teacherController");


// Register
router.post("/register", teacherRegistration);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Login
router.post("/login", teacherLogin);

// router.post("/register", registerTeacher);
// otp verification
// router.post("/login", loginTeacher);

module.exports = router;

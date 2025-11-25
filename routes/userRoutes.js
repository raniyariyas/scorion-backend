const express = require("express");
const router = express.Router();
const {
   studentregistration,
   verifyOtp,
   studentlogin
   } = require("../Controllers/studentController");


// login ,otpverify,register
router.post('/register',studentregistration);
router.post("/verify-otp",verifyOtp);
router.post("/login", studentlogin);

// login


module.exports = router;

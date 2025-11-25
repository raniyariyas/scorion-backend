const express = require("express");
const router = express.Router();
const { studentregistration,verifyOtp } = require("../Controllers/studentController");


// login ,otpverify,register
router.post('/register',studentregistration);
router.post("/verify-otp",verifyOtp);
// login


module.exports = router;

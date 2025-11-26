const express = require("express");
const router = express.Router();
const {
   studentregistration,
   verifyOtp,
   studentlogin,
   forgotPassword,
   verifyForgotOtp,
   resetPassword

   
   } = require("../Controllers/studentController");
const { authUser } = require("../Middleware/authMiddleware");

   
// login ,otpverify,register
router.post('/register',studentregistration);
router.post("/verify-otp",verifyOtp);
router.post("/login", studentlogin);
router.post('/forgot-password',forgotPassword);
router.post("/forgot-password/verify-otp", verifyForgotOtp);
router.post("/reset-password", resetPassword);
 


// login


module.exports = router;

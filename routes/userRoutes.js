const express = require("express");
const router = express.Router();

const {
   studentregistration,
   verifyOtp,
   studentlogin,
   forgotPassword,
   verifyForgotOtp,
   resetPassword,
   studentCreatePassword

   
   } = require("../Controllers/studentController");
const { authUser } = require("../Middleware/authMiddleware");

   
// login ,otpverify,register
router.post('/register',studentregistration);
router.post("/verify-otp",verifyOtp);
router.post("/login", studentlogin);
router.post('/forgot-password',forgotPassword);
router.post("/forgot-password/verify-otp", verifyForgotOtp);
router.post("/reset-password", resetPassword);
router.post("/createpassword/:token", studentCreatePassword);


// router.get("/set-password/:token", studentController.setPasswordPage);
// router.post("/createpassword/:token", studentController.savePassword);


// login


module.exports = router;

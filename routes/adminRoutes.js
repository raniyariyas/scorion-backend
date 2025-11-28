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
  unblockTeacher,
  blockTeacher, 
  editstudent,
  listStudents,
  blockStudent,
  unblockStudent,
  addStudent,
  editStudent
  


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
router.post("/new-password", resetAdminPassword);   

//teacher routes

router.post("/add-teacher",verifyToken("admin"), addTeacher);
router.put("/edit-teacher/:Id",verifyToken("admin"), editTeacher);
router.get("/teachers",verifyToken("admin") , listTeachers);
router.put("/blockteacher/:Id",verifyToken("admin") , blockTeacher);
router.put("/unblockteacher/:Id",verifyToken("admin") , unblockTeacher);

//student routes
router.post("/add-student", verifyToken("admin"),addStudent);
router.put("/edit-student/:Id", verifyToken("admin"), editStudent);
router.get("/students", verifyToken("admin"), listStudents);
router.put("/block-student/:Id", verifyToken("admin"), blockStudent);
router.put("/unblock-student/:Id", verifyToken("admin"), unblockStudent);


module.exports = router;

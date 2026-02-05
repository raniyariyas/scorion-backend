const express = require("express");
const router = express.Router();
const {
  teacherRegistration,
  verifyOtp,
  teacherLogin,
  teacherForgotPassword,       //  Add this
  verifyTeacherForgotOtp,      //  Add this
  resetTeacherPassword,          // Add this
  teacherpassword,
  addMark,
  getMarks,
  listMarks,
  searchstudentsteacher,
  updateMarks,
  getTeacherProfile,
  deleteMark,
  getStudentSyllabus,
  saveImprovementNotes,
  getImprovementNotes
} = require("../Controllers/teacherController");

const { verifyToken } = require("../Middleware/authMiddleware");
const authTeacher = verifyToken("teacher");
const { searchstudents } = require("../Controllers/adminController");

// Register
router.post("/createpassword/:token", teacherpassword);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Login
router.post("/login", teacherLogin);

//  Forgot Password Routes
router.post("/new-password", resetTeacherPassword);               // Step 3: Reset Password
router.post("/forgot-password", teacherForgotPassword);           // Step 1: Send OTP
router.post("/verify-forgot-otp", verifyTeacherForgotOtp);        // Step 2: Verify OTP

// add student marks
router.post("/add-mark", authTeacher, addMark);
//get student marks
router.get("/marks", authTeacher, listMarks);
router.get("/studentsearch/", authTeacher, searchstudentsteacher);
// Update marks
router.put("/update/:id", authTeacher, updateMarks);

// Get Student Syllabus
router.get("/student-syllabus/:studentId/:semester", authTeacher, getStudentSyllabus);

// Profile
router.get("/profile", authTeacher, getTeacherProfile);

// Delete Mark
router.delete("/delete-mark/:id", authTeacher, deleteMark);

// Improvement Notes
router.post("/students/improvement-notes", authTeacher, saveImprovementNotes);
router.get("/students/improvement-notes", authTeacher, getImprovementNotes);

module.exports = router;

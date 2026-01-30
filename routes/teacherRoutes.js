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
  deleteMark
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
router.post("/add-mark", addMark);
//get student marks
router.get("/marks", listMarks);
router.get("/studentsearch/",searchstudentsteacher);
// Update marks
router.put("/update/:id",updateMarks);

// Profile
router.get("/profile", authTeacher, getTeacherProfile);

// Delete Mark
router.delete("/delete-mark/:id", authTeacher, deleteMark);

// Improvement Notes
router.post("/students/improvement-notes", authTeacher, async (req, res) => {
  try {
    const { studentId, semester, improvementNotes } = req.body;
    const Mark = require("../Models/marks");
    const mongoose = require("mongoose");
    
    console.log("Saving improvement notes:", { studentId, semester });
    
    // Convert studentId to ObjectId if it's a string
    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId) 
      ? new mongoose.Types.ObjectId(studentId) 
      : studentId;
    
    const mark = await Mark.findOneAndUpdate(
      { student: studentObjectId, semester: String(semester) },
      { 
        $set: { 
          improvementNotes: {
            ...improvementNotes,
            facultyName: req.user.name || req.user.email || 'Faculty'
          }
        } 
      },
      { new: true }
    );
    
    if (!mark) {
      console.log("No mark found for studentId:", studentId, "semester:", semester);
      // Try to find what marks exist for this student
      const existingMarks = await Mark.find({ student: studentObjectId });
      console.log("Existing marks for student:", existingMarks.map(m => ({ semester: m.semester, id: m._id })));
      return res.status(404).json({ message: "Mark entry not found for this student/semester combination" });
    }
    
    console.log("Successfully updated mark:", mark._id);
    res.status(200).json({ message: "Improvement notes saved successfully", mark });
  } catch (error) {
    console.error("Error saving improvement notes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;

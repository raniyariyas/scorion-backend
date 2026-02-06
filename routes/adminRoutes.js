const express = require("express");
const { verifyToken } = require("../Middleware/authMiddleware");
const router = express.Router();
const {
  adminLogin,
  addTeacher,
  editTeacher,
  listTeachers,
  unblockTeacher,
  blockTeacher, 
  listStudents,
  blockStudent,
  unblockStudent,
  addStudent,
  editStudent,
  searchstudents,
  searchteachers,
  deleteTeacher,
  deleteStudent,
  getDashboardStats,
  broadcastGlobalAlert
} = require("../Controllers/adminController");

// Login (Public)
router.post("/login", adminLogin);

// Dashboard stats
router.get("/stats", verifyToken("admin"), getDashboardStats);
router.post("/broadcast-global", verifyToken("admin"), broadcastGlobalAlert);

//teacher routes (Protected)
router.post("/add-teacher", verifyToken("admin"), addTeacher);
router.put("/edit-teacher/:Id", verifyToken("admin"), editTeacher);
router.get("/teachers", verifyToken("admin"), listTeachers);
router.put("/blockteacher/:Id", verifyToken("admin"), blockTeacher);
router.put("/unblockteacher/:Id", verifyToken("admin"), unblockTeacher);

//student routes (Protected)
router.post("/add-student", verifyToken("admin"), addStudent);
router.put("/edit-student/:Id", verifyToken("admin"), editStudent);
router.get("/students", verifyToken("admin"), listStudents);
router.put("/block-student/:Id", verifyToken("admin"), blockStudent);
router.put("/unblock-student/:Id", verifyToken("admin"), unblockStudent);

// search box,status,dept
router.get("/teachersearch", verifyToken("admin"), searchteachers);
//search for students
router.get("/studentsearch", verifyToken("admin"), searchstudents);

// Delete routes
router.delete("/delete-teacher/:Id", verifyToken("admin"), deleteTeacher);
router.delete("/delete-student/:Id", verifyToken("admin"), deleteStudent);

module.exports = router;

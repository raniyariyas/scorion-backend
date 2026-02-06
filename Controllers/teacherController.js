const Teacher = require("../Models/Teacher");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Mark = require("../Models/marks");
const Student = require("../Models/User");
const User=require("../Models/User")

const sendEmail = require("../config/mail");
const Notification = require("../Models/Notification");
const Syllabus = require("../Models/Syllabus");

/**
 * Helper to create and emit notification for low attendance
 */
const checkAndNotifyLowAttendance = async (studentId, semester, attendancePercentage) => {
  if (attendancePercentage && attendancePercentage < 40) {
    try {
      // 1. Create notification in database
      const notification = await Notification.create({
        student: studentId,
        type: 'attendance_warning',
        title: '⚠️ Critical Attendance Alert',
        message: `Your attendance for Semester ${semester} is critically low at ${attendancePercentage}%. You need at least 75% attendance to be eligible for exams. Please contact your faculty immediately.`,
        severity: 'critical',
        relatedSemester: semester
      });
      
      console.log(`✅ Database notification created for student ${studentId}`);
      
      // 2. Real-time push via Socket.IO
      try {
        const { io, connectedUsers } = require("../server");
        if (io && connectedUsers) {
          const studentIdStr = studentId.toString();
          
          // Debugging: Log all connected IDs to help find mismatches
          const connectedUserIdsArray = Array.from(connectedUsers.keys());
          console.log('🔍 Socket Map check - Target:', studentIdStr);
          console.log('🔍 Connected User IDs:', connectedUserIdsArray);
          
          const studentSocketId = connectedUsers.get(studentIdStr);
          
          if (studentSocketId) {
            io.to(studentSocketId).emit('new-notification', {
              notification: notification,
              message: 'You have a new notification!'
            });
            console.log(`✅ Real-time notification SENT to socket ${studentSocketId}`);
          } else {
            console.log(`⚠️ Student ${studentIdStr} not currently connected (socket not found in map)`);
          }
        } else {
          console.log('❌ Socket.io or connectedUsers map not available from server.js');
        }
      } catch (socketError) {
        console.error('❌ Socket emit error:', socketError.message);
      }
    } catch (dbError) {
      console.error('❌ Notification creation error:', dbError.message);
    }
  }
};

// -------------------------
// TEACHER REGISTRATION
// -------------------------
exports.teacherpassword = async (req, res) => {
 try {
  console.log("Received request to set teacher password");
    const { token } = req.params;
    const { password } = req.body;
    const teacher = await Teacher.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!teacher) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    teacher.password = hashedPassword;
    teacher.resetPasswordToken = undefined;
    teacher.resetPasswordExpires = undefined;
    teacher.isVerified = true;

    await teacher.save();
    res.status(200).json({ message: "Password created successfully!" });
  } catch (err) {
    console.log("Password creation error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }

};

// -------------------------
// VERIFY OTP
// -------------------------
exports.verifyOtp = async (req, res) => {
    
  try {
    const { email, otp } = req.body;

    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(400).json({ message: "Teacher not found" });

    if (teacher.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (teacher.otpExpiry < Date.now()) return res.status(400).json({ message: "OTP expired" });

    teacher.isVerified = true;
    teacher.otp = null;
    teacher.otpExpiry = null;
    await teacher.save();

    res.status(200).json({ message: "OTP verified successfully!" });
  } catch (err) {
    console.log("OTP verification error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// -------------------------
// TEACHER LOGIN
// -------------------------
exports.teacherLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(400).json({ message: "Teacher not found" });
    if (!teacher.isVerified) 
        return res.status(400).json({ message: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) 
      return res.status(400).json({ message: "Incorrect password" });

    // Generate JWT token
    const token = jwt.sign(
      { id: teacher._id,
        role:"teacher",
        department: teacher.department },
      process.env.JWT_SECRET,
    );

      return res.json({
      message: "Login successful",
      token,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        subject: teacher.subject,
        qualification: teacher.highestQualification,
        experience: teacher.teachingExperience
      }
    });
  } catch (err) {
    console.log("Teacher login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.teacherForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const teacher = await Teacher.findOne({ email });
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        teacher.otp = otp;
        teacher.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
        await teacher.save();

        await sendEmail(email, otp, teacher.name, "Reset Your Scorion Password");

        res.json({ message: "OTP sent to your email" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};



exports.verifyTeacherForgotOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const teacher = await Teacher.findOne({ email });
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        if (teacher.otp !== otp || teacher.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.json({ message: "OTP verified successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};


exports.resetTeacherPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const teacher = await Teacher.findOne({ email });
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        teacher.password = hashedPassword;
        teacher.otp = undefined;
        teacher.otpExpiry = undefined;

        await teacher.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};


// create marks of student
exports.addMark = async (req, res) => {
  try {
    const { studentId, semester, subjects ,attendancePercentage,academicYear ,status } = req.body;

    if (!studentId || !semester || !subjects || subjects.length === 0 || !attendancePercentage || !academicYear || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Verify student department matches teacher department
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.department !== req.user.department) {
      return res.status(403).json({ message: "Access denied. You can only manage academic records for your department." });
    }

    // Calculate SGPA and total subjects
    const totalSubjects = subjects.length;
    let totalPoints = 0;

    const gradePoints = {
      "A+": 10, "A": 9, "B": 8, "C": 7, "D": 6, "F": 0
    };

    subjects.forEach(sub => {
      totalPoints += gradePoints[sub.grade] || 0;
    });

    const sgpa = totalSubjects ? (totalPoints / totalSubjects).toFixed(2) : 0;

    // Calculate overall grade
    const avgPoint = sgpa;
    let totalGrade = "N/A";
    if (avgPoint >= 9) totalGrade = "A+";
    else if (avgPoint >= 8) totalGrade = "A";
    else if (avgPoint >= 7) totalGrade = "B";
    else if (avgPoint >= 6) totalGrade = "C";
    else if (avgPoint >= 5) totalGrade = "D";
    else totalGrade = "F";

    const mark = new Mark({
      student: studentId,
      semester,
      subjects,
      sgpa,
      totalSubjects,
      totalGrade,
      academicYear,
      attendancePercentage,
      status
    });

    await mark.save();

    // Notify if attendance is low
    await checkAndNotifyLowAttendance(studentId, semester, attendancePercentage);

    res.status(201).json({ message: "Marks added successfully", mark });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get marks for a student
// exports.getMarks = async (req, res) => {
//   try {
//     const userid = req.params.Id;
//     console.log(userid,"hghf");
    

//     const marks = await Mark.find({ student: userid }).populate("student", "name email course semester");
//     console.log(marks,"uiuii");
    

//     res.status(200).json({ marks });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

//by fasal 

exports.listMarks = async (req, res) => {
  try {
    const { studentId } = req.query;
    const teacherDept = req.user.department;

    let query = {};
    if (studentId) {
      // If studentId is provided, first verify they belong to the teacher's department
      const student = await Student.findOne({ _id: studentId, department: teacherDept });
      if (!student) {
        return res.status(200).json({ marks: [] }); // Or 403, but 200 with empty list is safer for UI
      }
      query.student = studentId;
    } else {
      // Find all students in this department first
      const studentsInDept = await Student.find({ department: teacherDept }).select("_id");
      const studentIds = studentsInDept.map(s => s._id);
      query.student = { $in: studentIds };
    }
    
    const marks = await Mark.find(query).populate("student", "name email course department").sort({ semester: 1 });
    res.status(200).json({ marks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.searchstudentsteacher=async(req,res)=>{
 try {
    const { search, semester, status ,course } = req.query;

    const query = {
      department: req.user.department
    };

    if (search) {
      // Case-insensitive search on name
      query.name = { $regex: search, $options: "i" };
    }

    if (semester) {
      query.semester = semester;
    }

    if (status) {
      query.status = status;
    }


    if (course) {
      query.course = course;
    }

    const students = await User.find(query).sort({ name: 1 });

    res.status(200).json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }


}

// Update a student's marks
exports.updateMarks = async (req, res) => {
  try {
    const { id } = req.params; // the mark record ID
    const { subjects, totalGrade, SGPA, attendancePercentage, academicYear } = req.body; // data from frontend

    // Verify ownership/department
    const existingMark = await Mark.findById(id).populate('student');
    if (!existingMark) {
      return res.status(404).json({ message: "Mark record not found" });
    }

    if (existingMark.student.department !== req.user.department) {
      return res.status(403).json({ message: "Access denied. Student belongs to another department." });
    }

    // Proceed with update
    const updatedMark = await Mark.findByIdAndUpdate(
      id,
      { subjects, totalGrade, sgpa: SGPA, attendancePercentage, academicYear },
      { new: true }
    );

    if (!updatedMark) {
      return res.status(404).json({ message: "Mark record not found" });
    }

    // Check and notify for low attendance on update too
    await checkAndNotifyLowAttendance(updatedMark.student, updatedMark.semester, attendancePercentage);

    res.status(200).json({ message: "Marks updated successfully", updatedMark });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).select("-password");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteMark = async (req, res) => {
  try {
    const markId = req.params.id;
    const teacherDept = req.user.department;

    const existingMark = await Mark.findById(markId).populate('student');
    if (!existingMark) return res.status(404).json({ message: "Record not found" });

    if (existingMark.student.department !== teacherDept) {
      return res.status(403).json({ message: "Access denied. Student belongs to another department." });
    }

    await Mark.findByIdAndDelete(markId);
    res.status(200).json({ message: "Mark record purged successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentSyllabus = async (req, res) => {
  try {
    const { studentId, semester } = req.params;
    const student = await User.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.department !== req.user.department) {
      return res.status(403).json({ message: "Access denied. Student belongs to another department." });
    }

    const syllabus = await Syllabus.findOne({ 
      semester, 
      course: student.course,
      department: student.department 
    });
    
    if (!syllabus) {
      // Fallback to a general syllabus for that semester if specific one isn't found
      const fallbackSyllabus = await Syllabus.findOne({ semester });
      if (!fallbackSyllabus) {
        return res.status(404).json({ message: "Curriculum not found for this phase" });
      }
      return res.status(200).json(fallbackSyllabus);
    }
    
    res.status(200).json(syllabus);
  } catch (error) {
    console.error("Syllabus fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.saveImprovementNotes = async (req, res) => {
  try {
    const { studentId, semester, improvementNotes } = req.body;
    const mongoose = require("mongoose");
    
    // Verify student department before updating
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.department !== req.user.department) {
      return res.status(403).json({ message: "Access denied. Student belongs to another department branch." });
    }

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
      return res.status(404).json({ message: "Mark entry not found for this student/semester combination" });
    }
    
    res.status(200).json({ message: "Improvement notes saved successfully", mark });
  } catch (error) {
    console.error("Error saving improvement notes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getImprovementNotes = async (req, res) => {
  try {
    const { studentId, semester } = req.query;
    const mongoose = require("mongoose");
    
    if (!studentId || !semester) {
      return res.status(400).json({ message: "Student ID and semester are required" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.department !== req.user.department) {
      return res.status(403).json({ message: "Access denied. Student belongs to another department branch." });
    }

    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId) 
      ? new mongoose.Types.ObjectId(studentId) 
      : studentId;

    const mark = await Mark.findOne({ student: studentObjectId, semester: String(semester) });
    
    if (!mark) {
      return res.status(404).json({ message: "No records found" });
    }

    res.status(200).json({ improvementNotes: mark.improvementNotes });
  } catch (error) {
    console.error("Error fetching improvement notes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Send an alert to all students in the teacher's department
 */
exports.sendDeptAlert = async (req, res) => {
  try {
    const { message, title, severity } = req.body;
    const department = req.user.department;

    if (!message || !title) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    // Find all students in this department
    const students = await Student.find({ department });
    
    if (students.length === 0) {
      return res.status(404).json({ message: "No students found in your department" });
    }

    // Create notifications for all students
    const notifications = students.map(student => ({
      student: student._id,
      type: 'general',
      title: title,
      message: message,
      severity: severity || 'info'
    }));

    await Notification.insertMany(notifications);

    res.status(200).json({ 
      message: `Alert sent successfully to ${students.length} students in ${department}`,
      count: students.length
    });
  } catch (error) {
    console.error("Error sending dept alert:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

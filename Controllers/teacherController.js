const Teacher = require("../Models/Teacher");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Mark = require("../Models/marks");
const Student = require("../Models/User");
const User=require("../Models/User")

const sendEmail = require("../config/mail");

// -------------------------
// TEACHER REGISTRATION
// -------------------------
exports.teacherpassword = async (req, res) => {
 try {
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
    res.status(400).json({ message: "Incorrect password" });

    // Generate JWT token
    const token = jwt.sign(
      { id: teacher._id,
        role:"teacher" },
      process.env.JWT_SECRET,
    );

      res.json({
      message: "Login successful",
      token,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email
      }
    });


    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.log("Teacher login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.teacherForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const student = await Student.findOne({ email });
        if (!student) return res.status(404).json({ message: "Student not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        student.otp = otp;
        student.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
        await student.save();

        await emailtransporter(email, "Password Reset OTP", `Your OTP: ${otp}`);

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


exports.listMarks = async (req, res) => {
  try {    
    const marks = await Mark.find({}).populate("student", "name email course");    
    res.status(200).json({ marks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


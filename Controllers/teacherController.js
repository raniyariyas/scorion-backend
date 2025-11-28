const Teacher = require("../Models/Teacher");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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

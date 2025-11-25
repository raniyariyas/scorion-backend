const Teacher = require("../Models/Teacher");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../config/mail");

// -------------------------
// TEACHER REGISTRATION
// -------------------------
exports.teacherRegistration = async (req, res) => {
  try {
    console.log("kkkkkkkkkk");
    
    const { name, email, password } = req.body;

    // Check if teacher already exists
    const existing = await Teacher.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Teacher already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create teacher
    const newTeacher = new Teacher({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry
    });

    // Send OTP via email
    await sendEmail(email, otp);

    await newTeacher.save();

    res.status(201).json({ message: "Teacher registered successfully. Check email for OTP." });
  } catch (err) {
    console.log("Teacher registration error:", err);
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
    if (!teacher.isVerified) return res.status(400).json({ message: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    // Generate JWT token
    const token = jwt.sign(
      { id: teacher._id, email: teacher.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email
      }
    });
  } catch (err) {
    console.log("Teacher login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const User=require('../Models/User')
const Mark = require("../Models/marks");
const Teacher = require("../Models/Teacher");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail: emailtransporter } = require("../config/mail");
const dotenv = require("dotenv");
dotenv.config();


// user side
//user regustarion
exports.studentCreatePassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const student = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!student) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    student.password = hashedPassword;
    student.resetPasswordToken = undefined;
    student.resetPasswordExpires = undefined;
    student.isVerified = true;

    await student.save();

    res.status(200).json({ message: "Password created successfully!" });

  } catch (err) {
    console.log("Password creation error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.studentregistration=async(req,res)=>{
        try {
            const { name, email, password, phone, department, course } = req.body;
            console.log(req.body);
            
            // check existing
            const existing = await User.findOne({ email });
            
            if (existing) {
                return res.status(400).json({ message: "User already exists" });
            }
        
            // hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log(hashedPassword,"kkjj");

            // otp generation
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = Date.now() + 10 * 60 * 1000; 
            
            // create user db saving
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                phone,
                department,
                course,
                otp,
                otpExpiry
            });

            // await emailtransporter(email, otp); 
            await emailtransporter(email, otp);
        
            await newUser.save();
            console.log(newUser, "User saved successfully");
            
            res.status(201).json({ success: true, message: "User registered successfully check email" });
        
        } catch (err) {
            console.error("Registration error:", err);
            res.status(500).json({ message: "Server error", error: err.message });
        }
}




// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

      res.json({ success: true, message: "OTP verified successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// LOGIN
exports.studentlogin = async (req, res) => {
  console.log("jghhgggggggggggggg");
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log(user,"jhhussssssssssssssssssh");
    
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.isVerified)
      return res.status(400).json({ message: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    // Check if blocked
    if (user.isBlocked) {
      return res.status(403).json({ 
        message: "Account blocked", 
        reason: "Your account has been blocked by the admin." 
      });
    }

    // jwt
    console.log("hiiiii");
    
    const token = jwt.sign(
      { id: user._id ,role:"user"},
      process.env.JWT_SECRET,
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        course: user.course,
        semester: user.semester,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(req.body,"llllll");
        

        const user = await User.findOne({ email });
        if (!user){
           return res.status(404).json({ message: "User not found" });
        } 

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min
        await user.save();

        await emailtransporter(email, otp);

        res.json({ success: true, message: "OTP sent to your email" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server errrrrrrrrror" });
    }
};

exports.verifyForgotOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.json({ success: true, message: "OTP verified successfully" });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;

        await user.save();

        res.json({ success: true, message: "Password reset successful" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.studentVerifyForgotOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const student = await User.findOne({ email });
        if (!student) return res.status(404).json({ message: "Student not found" });

        if (student.otp !== otp || student.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.json({ message: "OTP verified successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.studentResetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const student = await User.findOne({ email });
        if (!student) return res.status(404).json({ message: "Student not found" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        student.password = hashedPassword;
        student.otp = undefined;
        student.otpExpiry = undefined;

        await student.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Get personal profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get personal marks
exports.getPersonalMarks = async (req, res) => {
  try {
    const marks = await Mark.find({ student: req.user.id }).sort({ semester: 1 });
    res.json({ marks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all faculty list
exports.getFacultyList = async (req, res) => {
  try {
    const teachers = await Teacher.find({ employmentStatus: "Active", isVerified: true })
      .select("name department subject")
      .sort({ name: 1 });
    res.status(200).json(teachers);
  } catch (err) {
    console.error("Faculty fetch error:", err);
    res.status(500).json({ message: "Error fetching faculty list" });
  }
};
// Get system-wide stats for About Page
exports.getSystemStats = async (req, res) => {
  try {
    const [studentCount, predictionCount] = await Promise.all([
      User.countDocuments({ isVerified: true }),
      Mark.countDocuments()
    ]);
    
    res.status(200).json({
      students: studentCount,
      predictions: predictionCount,
      accuracy: 96 // Represents the engine precision
    });
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ message: "Error fetching system stats" });
  }
};

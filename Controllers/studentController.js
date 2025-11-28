const User=require('../Models/User')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailtransporter = require("../config/mail");
const dotenv = require("dotenv");
dotenv.config();


// user side


exports.studentregistration=async(req,res)=>{
        try {
            const { name, email, password } = req.body;
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
              password:hashedPassword,
              otp,
            otpExpiry
            });

            emailtransporter(email,otp);
        
            await newUser.save();
            console.log(newUser,"llllllllll");
            
        
            res.status(201).json({ message: "User registered successfully check email" });
        
          } catch (err) {
            res.status(500).json({ message: "Server error" });
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

      res.json({ message: "OTP verified successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      },
    });

    res.json({ message: "Login successful" });
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

        res.json({ message: "OTP sent to your email" });
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

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.json({ message: "OTP verified successfully" });

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
        user.otpExpires = undefined;

        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.studentVerifyForgotOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const student = await Student.findOne({ email });
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
        const student = await Student.findOne({ email });
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




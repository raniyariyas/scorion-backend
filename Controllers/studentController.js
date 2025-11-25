const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailtransporter = require("../config/mail");

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





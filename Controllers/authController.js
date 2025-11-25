const User = require("../models/User");
const nodemailer = require("nodemailer");


// REGISTER
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//      // 1. Check if user already exists
//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // 2. Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
// // 3. Set OTP expiry (5 minutes)
//     const otpExpiry = Date.now() + 5 * 60 * 1000;
// // 4. Create user with OTP
//     const user = new User({
//       name,
//       email,
//       password,
//       otp,
//       otpExpiry,
//     });

//     await user.save();
//      // 5. Send OTP email
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Your OTP Verification Code",
//       text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
//     });

//      res.json({ message: "User registered. OTP sent to email." });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



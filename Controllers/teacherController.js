// const Teacher = require("../models/Teacher");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const transporter = require("../config/mail");

// // REGISTER TEACHER
// exports.registerTeacher = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const exist = await Teacher.findOne({ email });
//     if (exist) return res.status(400).json({ message: "Teacher exists" });

//     const salt = await bcrypt.genSalt(10);
//     const hashed = await bcrypt.hash(password, salt);

//     const teacher = await Teacher.create({
//       name,
//       email,
//       password: hashed,
//       otp: Math.floor(100000 + Math.random() * 900000),
//       otpExpire: Date.now() + 10 * 60 * 1000
//     });

//     await transporter.sendMail({
//       to: email,
//       subject: "Teacher Verification OTP",
//       text: `Your OTP: ${teacher.otp}`
//     });

//     res.json({ message: "Teacher registered, OTP sent." });

//   } catch (err) {
//     res.json({ error: err.message });
//   }
// };

// // TEACHER LOGIN
// exports.loginTeacher = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const teacher = await Teacher.findOne({ email });

//     if (!teacher) return res.status(400).json({ message: "Teacher not found" });

//     const valid = await bcrypt.compare(password, teacher.password);
//     if (!valid) return res.status(400).json({ message: "Wrong password" });

//     const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET);

//     res.json({ message: "Login successful", token });

//   } catch (err) {
//     res.json({ error: err.message });
//   }
// };

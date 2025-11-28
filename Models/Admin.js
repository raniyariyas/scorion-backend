const mongoose = require("mongoose");

// const teacherSubSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   phone: { type: String },
//   salary: { type: Number },
//   department: { type: String },
//   subject: { type: String },
//   highestQualification: { type: String },
//   teachingExperience: { type: String },
//   joinDate: { type: Date },
//   employmentStatus: {
//     type: String,
//     enum: ["Active", "Inactive", "On Leave", "Resigned"],
//     default: "Active"
//   },

//   createdAt: { type: Date, default: Date.now }
// });

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
  // teachers: [teacherSubSchema] // teachers stored inside admin
  // Admin stores teachers inside itself
});

module.exports = mongoose.model("Admin", adminSchema);

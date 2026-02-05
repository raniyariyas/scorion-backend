const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  password: String,
  otp: String,
  otpExpiry: Date,
  isVerified: { type: Boolean, default: false },
  salary: Number,
  department: String,
  subject: String,
  highestQualification: String,
  teachingExperience: String,
  joinDate: Date,
  employmentStatus: {
    type: String,
    enum: ["Active", "Inactive", "On Leave", "Resigned"],
    default: "Active"
  },
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: String,  
  resetPasswordExpires: Date 
});


module.exports = mongoose.model("Teacher", teacherSchema);

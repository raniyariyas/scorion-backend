const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  otp: String,
  otpExpiry: Date,
  isVerified: { type: Boolean, default: false },
  salary: { type: Number },
  department: { type: String },
  subject: { type: String },
  highestQualification: { type: String },
  teachingExperience: { type: String },
  joinDate: { type: Date },
  employmentStatus: {
    type: String,
    enum: ["Active", "Inactive", "On Leave", "Resigned"],
    default: "Active"
  },
    isBlocked: {
    type: Boolean,
    default: false
  },


  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Teacher", teacherSchema);

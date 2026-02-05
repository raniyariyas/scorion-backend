const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isVerified: { type: Boolean, default: false },
  phone: String,
  course: { 
    type: String, 
    required: false
  },

  semester: { type: String, required: false },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  isBlocked: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  createdAt: { type: Date, default: Date.now }
  
});

module.exports = mongoose.model("User", userSchema);

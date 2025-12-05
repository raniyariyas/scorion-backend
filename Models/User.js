const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isVerified: { type: Boolean, default: false },
  phone: String,
  // course: { type: String, required: true },
  course: { 
  type: String, 
  required: true,
  enum: ["Computer Science", "Electrical Engineering"]
},

  semester: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
  
});

module.exports = mongoose.model("User", userSchema);

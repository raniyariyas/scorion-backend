const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password:String,
  otp: String,
    otpExpiry: Date,
    isVerified: { type: Boolean, default: false },
   phone: String,
  course: { type: String, required: true },
  semester: { type: String, required: true },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },
  enrollmentDate: { type: Date, default: Date.now },
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model("User", userSchema);

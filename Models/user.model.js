// models/user.model.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "teacher"], required: true },
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", userSchema);
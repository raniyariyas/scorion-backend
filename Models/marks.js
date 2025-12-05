const mongoose = require("mongoose");

const markSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  academicYear: { type: String },
  attendancePercentage: { type: Number, min: 0, max: 100 },
  subjects: [
    {
      name: { type: String, required: true },
      grade: { type: String, required: true } // e.g., "A+", "A", "B", etc.
    }
  ],
  sgpa: { type: Number, default: 0 },
  totalSubjects: { type: Number, default: 0 },
  totalGrade: { type: String, default: "N/A" },
resultPublishedAt: {
  type: String,
  default: () => new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
},
  status: { type: String, enum: ["passed", "failed"], default: "pending" }  
}, );


module.exports = mongoose.model("Mark", markSchema);

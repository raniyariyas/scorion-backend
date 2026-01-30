const mongoose = require("mongoose");

const markSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  semester: { type: String, required: true, min: 1, max: 8 },
  academicYear: { type: String },
  attendancePercentage: { type: Number, min: 0, max: 100 },
  subjects: [
    {
      name: { type: String, required: true },
      marks: { type: Number, default: 0 }, // Raw numeric score
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
  status: { type: String, enum: ["passed", "failed"], default: "pending" },
  
  // Faculty Improvement Recommendations
  improvementNotes: {
    overall: { type: String, default: "" }, // General semester feedback
    subjectSpecific: [
      {
        subjectName: { type: String },
        feedback: { type: String }
      }
    ],
    facultyName: { type: String },
    lastUpdated: { type: Date }
  }
});


module.exports = mongoose.model("Mark", markSchema);

const mongoose = require("mongoose");

const syllabusSchema = new mongoose.Schema({
  semester: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  title: String,
  description: String,
  subjects: [{
    name: String,
    code: String,
    credits: Number,
    internalMarks: { type: Number, default: 30 },
    externalMarks: { type: Number, default: 70 },
    totalMarks: { type: Number, default: 100 },
    difficulty: String,
    color: String,
    bg: String
  }]
});

module.exports = mongoose.model("Syllabus", syllabusSchema);

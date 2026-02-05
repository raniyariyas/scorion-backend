const mongoose = require("mongoose");

const syllabusSchema = new mongoose.Schema({
  semester: {
    type: String,
    required: true,
    unique: true
  },
  title: String,
  description: String,
  subjects: [{
    name: String,
    code: String,
    credits: Number,
    difficulty: String,
    color: String,
    bg: String
  }]
});

module.exports = mongoose.model("Syllabus", syllabusSchema);

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: false 
  },
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Teacher", 
    required: false 
  },
  type: { 
    type: String, 
    enum: ['attendance_warning', 'improvement_feedback', 'grade_update', 'general'],
    default: 'general'
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  relatedSemester: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Notification", notificationSchema);

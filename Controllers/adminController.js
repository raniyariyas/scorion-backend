const Teacher = require('../Models/Teacher');
const Student = require('../Models/User');
const Mark = require('../Models/marks');
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Notification = require('../Models/Notification');
const { sendAccountCreationEmail } = require("../config/mail");
dotenv.config();

// ADMIN LOGIN (Hardcoded from .env)
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check against .env values
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: "SUPER_ADMIN", role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: {
        id: "SUPER_ADMIN",
        name: "Administrator",
        email: process.env.ADMIN_EMAIL,
      }
    });

  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// add teacher
exports.addTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      salary,
      department,
      subject,
      highestQualification,
      teachingExperience,
      joinDate,
      employmentStatus,
      isBlocked
    } = req.body;

    const token = crypto.randomBytes(20).toString('hex');
    
    const newTeacher = new Teacher({
      name,
      email,
      phone,
      salary,
      department,
      subject,
      highestQualification,
      teachingExperience,
      joinDate,
      employmentStatus,
      isBlocked: isBlocked || false,
      resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 3600000 // 1 hour
    });
    await newTeacher.save();

    await sendAccountCreationEmail(email, name, "teacher", token);

    return res.status(201).json({
      message: "Teacher added successfully",
      teachers: newTeacher
    });

  } catch (error) {
    console.error("Error adding teacher:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Each teacher must have a unique ${field}.` 
      });
    }
    return res.status(500).json({
      message: "Error adding teacher",
      error: error.message
    });
  }
};

// EDIT TEACHER
exports.editTeacher = async (req, res) => {
  try {
    const teacherId = req.params.Id;
    const {
      name,
      email,
      phone,
      salary,
      department,
      subject,
      highestQualification,
      teachingExperience,
      joinDate,
      isBlocked
    } = req.body;

    console.log(`[Admin] EDIT TEACHER - ID: ${teacherId}, Target Block Status: ${isBlocked}`);

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (salary !== undefined) updateData.salary = salary;
    if (department !== undefined) updateData.department = department;
    if (subject !== undefined) updateData.subject = subject;
    if (highestQualification !== undefined) updateData.highestQualification = highestQualification;
    if (teachingExperience !== undefined) updateData.teachingExperience = teachingExperience;
    if (joinDate !== undefined) updateData.joinDate = joinDate;
    if (isBlocked !== undefined) updateData.isBlocked = isBlocked;

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { $set: updateData },
      { new: true }
    );
    
    if (!updatedTeacher) {
      console.log(`[Admin] Teacher not found for update: ${teacherId}`);
      return res.status(404).json({ message: "Teacher not found" });
    }

    console.log(`[Admin] Teacher ${updatedTeacher.email} update successful. isBlocked: ${updatedTeacher.isBlocked}`);

    return res.status(200).json({
      message: "Teacher updated successfully",
      teacher: updatedTeacher
    });

  } catch (error) {
    console.error(`[Admin] Error updating teacher ${req.params.Id}:`, error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists on another account.` 
      });
    }
    return res.status(500).json({ message: "Error updating teacher", error: error.message });
  }
};

// list teachers
exports.listTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    return res.status(200).json({
      message: "Teachers fetched successfully",
      teachers
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching teachers",
      error: error.message
    });
  }
};

// block teacher
exports.blockTeacher = async (req, res) => {
    try {
        const teacherId = req.params.Id;
        const teacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { isBlocked: true },
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        return res.status(200).json({
            message: "Teacher blocked successfully",
            teacher
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error blocking teacher",
            error: error.message
        });
    }
};

// unblock teacher
exports.unblockTeacher = async (req, res) => {
    try {
        const teacherId = req.params.Id;
        const teacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { isBlocked: false },
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        return res.status(200).json({
            message: "Teacher unblocked successfully",
            teacher
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error unblocking teacher",
            error: error.message
        });
    }
};
 
// add student
exports.addStudent = async (req, res) => {
  try {
    const { name, email, phone, course, department, semester, status, isBlocked } = req.body;
    const token = crypto.randomBytes(20).toString("hex");

    const newStudent = new Student({
      name,
      email,
      phone,
      course,
      department,
      semester,
      status,
      isBlocked: isBlocked || false,
      resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 3600000 // 1 hour
    });

    await newStudent.save();

    await sendAccountCreationEmail(email, name, "student", token);

    return res.status(201).json({
      message: "Student added successfully & email sent",
      student: newStudent
    });

  } catch (error) {
    console.error("Error adding student:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already registered. Each student must have a unique ${field}.` 
      });
    }
    return res.status(500).json({ message: "Error adding student", error: error.message });
  }
};

// EDIT STUDENT
exports.editStudent = async (req, res) => {
  try {
    const studentId = req.params.Id;
    const { name, email, phone, course, department, semester, isBlocked, enrollmentDate } = req.body;

    console.log(`[Admin] EDIT STUDENT - ID: ${studentId}, Target Block Status: ${isBlocked}`);

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (course !== undefined) updateData.course = course;
    if (department !== undefined) updateData.department = department;
    if (semester !== undefined) updateData.semester = semester;
    if (enrollmentDate !== undefined) updateData.enrollmentDate = enrollmentDate;
    if (isBlocked !== undefined) updateData.isBlocked = isBlocked;

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $set: updateData },
      { new: true }
    );
    
    if (!updatedStudent) {
      console.log(`[Admin] Student not found for update: ${studentId}`);
      return res.status(404).json({ message: "Student not found" });
    }

    console.log(`[Admin] Student ${updatedStudent.email} update successful. isBlocked: ${updatedStudent.isBlocked}`);

    return res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent
    });

  } catch (error) {
    console.error(`[Admin] Error updating student ${req.params.Id}:`, error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already registered to another student.` 
      });
    }
    return res.status(500).json({ message: "Error updating student", error: error.message });
  }
};

// LIST STUDENTS
exports.listStudents = async (req, res) => {
  try {
    const students = await Student.find();
    return res.status(200).json({
      message: "Students fetched successfully",
      students
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching students",
      error: error.message
    });
  }
};

// BLOCK STUDENT
exports.blockStudent = async (req, res) => {
    try {
        const studentId = req.params.Id;
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { isBlocked: true },
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        return res.status(200).json({
            message: "Student blocked successfully",
            student: updatedStudent
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error blocking student",
            error: error.message
        });
    }
};

// UNBLOCK STUDENT
exports.unblockStudent = async (req, res) => {
    try {
        const studentId = req.params.Id;
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { isBlocked: false },
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        return res.status(200).json({
            message: "Student unblocked successfully",
            student: updatedStudent
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error unblocking student",
            error: error.message
        });
    }
};

// SEARCH TEACHERS
exports.searchteachers = async (req, res) => {
  try {
    const { search, status, department } = req.query;
    let filter = {};

    if (search && search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } }
      ];
    }

    if (status && status !== "All Status") {
      filter.employmentStatus = status;
    }

    if (department && department !== "All Departments") {
      filter.department = department;
    }

    const teachers = await Teacher.find(filter);
    res.status(200).json({
      total: teachers.length,
      teachers
    });
  } catch (error) {
    res.status(500).json({
      message: "Error searching teachers",
      error: error.message
    });
  }
};

// SEARCH STUDENTS
exports.searchstudents = async (req, res) => {
  try {
    const { search, status, course } = req.query;
    let filter = {};

    if (search && search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { course: { $regex: search, $options: "i" } }
      ];
    }

    if (status && status !== "All Status") {
      filter.status = status;
    }

    if (course && course !== "All Courses") {
      filter.course = course;
    }

    const students = await Student.find(filter);
    res.status(200).json({
      total: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({
      message: "Error searching students",
      error: error.message
    });
  }
};

// DELETE TEACHER
exports.deleteTeacher = async (req, res) => {
  try {
    const teacherId = req.params.Id;
    const deletedTeacher = await Teacher.findByIdAndDelete(teacherId);
    if (!deletedTeacher) return res.status(404).json({ message: "Teacher not found" });
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting teacher", error: error.message });
  }
};

// DELETE STUDENT
exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.Id;
    const deletedStudent = await Student.findByIdAndDelete(studentId);
    if (!deletedStudent) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting student", error: error.message });
  }
};

// GET DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, totalTeachers, allMarks] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Mark.find().populate('student')
    ]);

    // Calculate Average GPA
    const validMarks = allMarks.filter(m => m.sgpa > 0);
    const avgGPA = validMarks.length > 0 
      ? (validMarks.reduce((acc, curr) => acc + curr.sgpa, 0) / validMarks.length).toFixed(2)
      : "0.00";

    // Get Active Courses
    const courses = await Student.distinct("course");

    // Get Recent Activity (e.g., last 5 students added)
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(3);
    const recentTeachers = await Teacher.find().sort({ createdAt: -1 }).limit(2);

    const systemEvents = [
      ...recentStudents.map(s => ({ action: `Student Enrolled: ${s.name}`, time: 'Recently', type: 'user' })),
      ...recentTeachers.map(t => ({ action: `Teacher Onboarded: ${t.name}`, time: 'Recently', type: 'security' }))
    ];

    // Get Course Metrics
    const courseStats = {};
    allMarks.forEach(m => {
      const cName = m.student?.course || 'General';
      if (!courseStats[cName]) {
        courseStats[cName] = { totalSGPA: 0, count: 0 };
      }
      courseStats[cName].totalSGPA += m.sgpa;
      courseStats[cName].count += 1;
    });

    const courseMetrics = Object.keys(courseStats).map((name, idx) => {
      const avg = (courseStats[name].totalSGPA / courseStats[name].count).toFixed(1);
      const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500'];
      const score = Math.min(Math.round(parseFloat(avg) * 10), 100);
      return {
        name,
        current: score,
        progress: score,
        color: colors[idx % colors.length],
        predicted: Math.min(score + 5, 100)
      };
    }).slice(0, 4);

    // Get Upcoming Alerts (Pending Accounts or System Tasks)
    const pendingTeachers = await Teacher.find({ isVerified: false }).limit(3);
    const upcomingAlerts = [
      ...pendingTeachers.map(t => ({
        subject: 'Onboarding',
        title: `Pending: ${t.name}`,
        date: 'Action Required',
        weight: 'Account',
        priority: 'High'
      })),
      {
        subject: 'System',
        title: 'Institutional Audit',
        date: 'Continuous',
        weight: 'Automated',
        priority: 'Medium'
      }
    ];

    res.status(200).json({
      stats: [
        { label: 'Institutional Avg', value: avgGPA, change: 'LIVE', trend: 'up' },
        { label: 'Total Students', value: totalStudents.toString(), change: 'Students', trend: 'neutral' },
        { label: 'Active Teachers', value: totalTeachers.toString(), change: 'Faculties', trend: 'neutral' },
        { label: 'Active Courses', value: courses.length.toString(), change: 'Domains', trend: 'neutral' }
      ],
      systemEvents,
      courseMetrics,
      upcomingAlerts,
      allMarks
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

/**
 * Broadcast a notification to every user in the system
 */
exports.broadcastGlobalAlert = async (req, res) => {
  try {
    const { title, message, severity } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    // Find all active students/users and teachers
    const [students, teachers] = await Promise.all([
      Student.find({ isBlocked: false }),
      Teacher.find({ isBlocked: false, isVerified: true })
    ]);
    
    if (students.length === 0 && teachers.length === 0) {
      return res.status(404).json({ message: "No active users or faculty found to receive broadcast" });
    }

    // Create notifications for all students
    const studentNotifications = students.map(user => ({
      student: user._id,
      type: 'general',
      title: title,
      message: message,
      severity: severity || 'info'
    }));

    // Create notifications for all teachers
    const teacherNotifications = teachers.map(teacher => ({
      teacher: teacher._id,
      type: 'general',
      title: title,
      message: message,
      severity: severity || 'info'
    }));

    await Notification.insertMany([...studentNotifications, ...teacherNotifications]);

    res.status(200).json({ 
      message: `Global broadcast sent successfully to ${students.length} students and ${teachers.length} faculty members`,
      count: students.length + teachers.length
    });
  } catch (error) {
    console.error("Error sending global broadcast:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

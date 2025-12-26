const Admin = require("../models/admin");
const Teacher=require('../Models/Teacher')
const Student=require('../Models/User')
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const emailtransporter = require("../config/mail"); // your existing mail function
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// ADMIN REGISTRATION
exports.adminRegistration = async (req, res) => {
  try {
    console.log("register");
    
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create admin record
    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
    });

    await newAdmin.save();

    // Send OTP to admin email
    emailtransporter(email, otp);

    res.status(201).json({
      message: "Admin registered successfully. Check your email for OTP." ,success:true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
// VERIFY ADMIN OTP
exports.verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(req.body,"llllllllllllllll");
    

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
  
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // Check OTP match
    if (admin.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check OTP expiry
    if (admin.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Verify admin
    admin.isVerified = true;
    admin.otp = null;
    admin.otpExpiry = null;

    await admin.save();

    res.json({ message: "OTP verified successfully!" ,success:true});

  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const jwt = require("jsonwebtoken");

// ADMIN LOGIN
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // Check if admin verified
    if (!admin.isVerified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // OPTIONAL: Generate JWT Token
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      }
    });

  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email,"lllllllllll");
    
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    admin.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min
    await admin.save();

    await emailtransporter(email, "Admin Password Reset OTP", `Your OTP: ${otp}`);

    res.json({success:true, message: "OTP sent to your email" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyAdminForgotOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.otp !== otp || admin.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetAdminPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    admin.otp = undefined;
    admin.otpExpiry = undefined;

    await admin.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// resend password otp

exports.resendPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.otp = newOtp;
    admin.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    await admin.save();

    // TODO: send OTP via email
    console.log("Resent OTP:", newOtp);

    res.json({ message: "OTP resent successfully", otp: newOtp });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};




// add teacher
exports.addTeacher = async (req, res) => {
  try {
    const adminId = req.user.id; // coming from JWT
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
      employmentStatus
    } = req.body;

    // Find admin
    const admin = await Admin.findById(adminId);

    if (!admin){
       return res.status(404).json({ message: "Admin not found" });
    } 
        const token = crypto.randomBytes(20).toString('hex');
    // dbsave
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
      resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 3600000 // 1 hour
    });
    await newTeacher.save();


    // email send link

   const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "set your password",
       text: `Hello ${name},\n\nPlease click the link below to set your password:\n\nhttp://localhost:5000/api/teacher/set-password/${token}\n\nThis link will expire in 1 hour.`

    });




     return res.status(201).json({
      message: "Teacher added successfully",
      teachers: newTeacher
    });

   } catch (error) {
    return res.status(500).json({
      message: "Error adding teacher",
      error: error.message
    });
  }
};

// EDIT TEACHER
exports.editTeacher = async (req, res) => {
  try {
    const adminId = req.user.id; // from JWT
    const teacherId = req.params.Id; // teacher subdocument _id
    const updateData = req.body; // fields to update

    // Find admin
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Find teacher inside admin.teachers array
    const teacher =await Teacher.findById(teacherId);

    console.log(teacher,"jjjj");
    
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const updateddata=await Teacher.findByIdAndUpdate(teacherId,updateData,{new:true});
  
    await updateddata.save();

    return res.status(200).json({
      message: "Teacher updated successfully",
      teacher
    });

  } catch (error) {
    return res.status(500).json({ message: "Error updating teacher", error: error.message });
  }
};

// list teachers
exports.listTeachers = async (req, res) => {
  try {
    const adminId = req.user.id; // from JWT token

    // Find admin
    const admin = await Admin.findById(adminId);

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const teachers = await Teacher.find();

    // Return teachers array
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


// block

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
    const adminId = req.user.id; // JWT admin ID
    const { name, email, phone, course, semester, status } = req.body;
    

    // Check admin exists
    const admin = await Admin.findById(adminId);
    console.log(admin,",,,,,,,,,,,,,,");
    
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Generate token for student password
    const token = crypto.randomBytes(20).toString("hex");
    console.log(token,"mmmmmmmmmmmmmmmmmmmmmm");
    

    // Create student
    const newStudent = new Student({
      name,
      email,
      phone,
      course,
      semester,
      status,
      resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 3600000 // 1 hour
    });

    await newStudent.save();

    

    // Send email with backend link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Set Your Student Account Password",
      text: `Hello ${name},\n\nPlease click the link below to set your password:\n\nhttp://localhost:5000/api/student/createpassword/${token}\n\nThis link will expire in 1 hour.`
    });

    return res.status(201).json({
      message: "Student added successfully & email sent",
      student: newStudent
    });

  } catch (error) {
    return res.status(500).json({ message: "Error adding student", error: error.message });
  }
};


// EDIT STUDENT
exports.editStudent = async (req, res) => {
  try {
    const adminId = req.user.id; // from JWT
    const studentId = req.params.Id; // student _id
    const updateData = req.body; // fields to update

    // Find admin
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Find student
    const Student = await student.findById(studentId);
    if (!Student) return res.status(404).json({ message: "Student not found" });

    // Update student
    const updatedStudent = await student.findByIdAndUpdate(studentId, updateData, { new: true });
    await updatedStudent.save();

    return res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent
    });

  } catch (error) {
    return res.status(500).json({ message: "Error updating student", error: error.message });
  }
};

// LIST STUDENTS
exports.listStudents = async (req, res) => {
  try {
    const adminId = req.user.id; // from JWT token

    // Find admin
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Fetch all students
    const students = await Student.find();

    // Return students array
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

        const Student = await student.findByIdAndUpdate(
            studentId,
            { isBlocked: true },
            { new: true }
        );

        if (!Student) {
            return res.status(404).json({ message: "Student not found" });
        }

        return res.status(200).json({
            message: "Student blocked successfully",
            Student
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

        const student = await Student.findByIdAndUpdate(
            studentId,
            { isBlocked: false },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        return res.status(200).json({
            message: "Student unblocked successfully",
            student
        });

    } catch (error) {
        res.status(500).json({
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

    // 🔍 Search by name, email, course
    if (search && search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { course: { $regex: search, $options: "i" } }
      ];
    }

    // 🎯 Status Filter (Active, Inactive)
    if (status && status !== "All Status") {
      filter.status = status;
    }

    // 🎓 Course Filter
    if (course && course !== "All Courses") {
      filter.course = course;
    }

    // Fetch students from DB
    const students = await Student.find(filter);

    // Response format identical to teacher
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

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Teacher = require("../Models/Teacher");
const User = require("../Models/User");
dotenv.config();


// token verification middleware
// MAIN FUNCTION (FACTORY)
exports.verifyToken = (role) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);      

      if (decoded.role !== role) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check for blocked status in database
      if (role === "teacher") {
        const teacher = await Teacher.findById(decoded.id);
        if (!teacher || teacher.isBlocked) {
          return res.status(403).json({ 
            message: "Account blocked", 
            reason: "Your account has been blocked by the admin." 
          });
        }
      } else if (role === "user") {
        const student = await User.findById(decoded.id);
        if (!student || student.isBlocked) {
          return res.status(403).json({ 
            message: "Account blocked", 
            reason: "Your account has been blocked by the admin." 
          });
        }
      }

      req.user = decoded; // save logged-in user
      
      next();

    } catch (err) {
      console.log(err);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};


// EXPORT MIDDLEWARE BASED ON ROLE
exports.authUser = exports.verifyToken("user");
exports.authAdmin = exports.verifyToken("admin");
exports.authTeacher = exports.verifyToken("teacher");

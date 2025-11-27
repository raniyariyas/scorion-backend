const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();


// tokem verification middleware
// MAIN FUNCTION (FACTORY)
exports. verifyToken = (role) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);      

      if (decoded.role !== role) {
        return res.status(403).json({ message: "Access denied" });
      }


      req.user = decoded; // save logged-in user
      console.log(req.user,"kjhjjhjhh");
      
      next();

    } catch (err) {
      console.log(err);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};


// EXPORT MIDDLEWARE BASED ON ROLE
// exports.authUser = verifyToken("user");
// exports.authAdmin = verifyToken(" admin");
// exports.authTeacher = verifyToken("teacher");

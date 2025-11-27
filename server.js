const express = require("express");
const cors = require("cors");
const mongoose=require('mongoose')
const connectDB = require("./config/db");
const dotenv = require("dotenv");

dotenv.config();

const userRoutes=require('./routes/userRoutes')
const teacherRoutes=require('./routes/teacherRoutes')
const adminRoutes=require('./routes/adminRoutes')

const app = express();

// Connect to DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Connection Error: ", err));


// Middlewares
app.use(cors());
app.use(express.json());

// Routes

app.use("/api/teacher",teacherRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/user",userRoutes);




// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

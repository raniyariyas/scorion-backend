const Syllabus = require("../Models/Syllabus");
const User = require("../Models/User");

exports.getSyllabusBySemester = async (req, res) => {
  try {
    const { semester } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attempt to find syllabus specific to user's course and department
    const syllabus = await Syllabus.findOne({ 
      semester, 
      course: user.course,
      department: user.department 
    });
    
    if (!syllabus) {
      // Fallback: If no specific syllabus found, try to find a general one for that semester 
      // (or we can return 404, but let's be more resilient)
      const fallbackSyllabus = await Syllabus.findOne({ semester });
      if (!fallbackSyllabus) {
        return res.status(404).json({ message: "Syllabus not found for this phase" });
      }
      return res.status(200).json(fallbackSyllabus);
    }
    
    res.status(200).json(syllabus);
  } catch (error) {
    console.error("Syllabus error:", error);
    res.status(500).json({ message: "Error syncing syllabus registry" });
  }
};

exports.getAllSyllabus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const syllabus = await Syllabus.find({ 
      course: user.course,
      department: user.department 
    }).sort({ semester: 1 });
    
    res.status(200).json(syllabus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching curriculum matrix" });
  }
};

// Admin/Faculty might use this to update
exports.updateSyllabus = async (req, res) => {
  try {
    const { semester, department, course, title, description, subjects } = req.body;
    const syllabus = await Syllabus.findOneAndUpdate(
      { semester, department, course },
      { title, description, subjects },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: "Curriculum synchronized", syllabus });
  } catch (error) {
    res.status(500).json({ message: "Synchronization failed" });
  }
};

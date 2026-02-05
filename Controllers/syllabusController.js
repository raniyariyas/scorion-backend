const Syllabus = require("../Models/Syllabus");

exports.getSyllabusBySemester = async (req, res) => {
  try {
    const { semester } = req.params;
    const syllabus = await Syllabus.findOne({ semester });
    
    if (!syllabus) {
      return res.status(404).json({ message: "Syllabus not found for this phase" });
    }
    
    res.status(200).json(syllabus);
  } catch (error) {
    res.status(500).json({ message: "Error syncing syllabus registry" });
  }
};

exports.getAllSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.find().sort({ semester: 1 });
    res.status(200).json(syllabus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching curriculum matrix" });
  }
};

// Admin/Faculty might use this to update
exports.updateSyllabus = async (req, res) => {
  try {
    const { semester, title, description, subjects } = req.body;
    const syllabus = await Syllabus.findOneAndUpdate(
      { semester },
      { title, description, subjects },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: "Curriculum synchronized", syllabus });
  } catch (error) {
    res.status(500).json({ message: "Synchronization failed" });
  }
};

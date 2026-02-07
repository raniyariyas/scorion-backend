const Syllabus = require("../Models/Syllabus");
const User = require("../Models/User");
const Mark = require("../Models/marks");

exports.getSyllabusBySemester = async (req, res) => {
  try {
    const { semester } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Get the standard syllabus
    const syllabus = await Syllabus.findOne({ 
      semester, 
      course: user.course,
      department: user.department 
    });
    
    // 2. Get the student's actual marks for this semester to find extra subjects
    const marks = await Mark.findOne({ 
      student: req.user.id,
      semester 
    });

    let combinedSubjects = [];
    let title = `${user.course} - Semester ${semester}`;
    let description = `Academic curriculum for ${user.course}, Semester ${semester}`;

    if (syllabus) {
      combinedSubjects = [...syllabus.subjects];
      title = syllabus.title;
      description = syllabus.description;
    } else {
      // Fallback: try general syllabus if course-specific not found
      const fallback = await Syllabus.findOne({ semester });
      if (fallback) {
        combinedSubjects = [...fallback.subjects];
        title = fallback.title;
        description = fallback.description;
      }
    }

    // 3. Merge extra subjects from Marks if they don't exist in Syllabus
    if (marks && marks.subjects) {
      marks.subjects.forEach(markSub => {
        const alreadyExists = combinedSubjects.some(s => s.name.toLowerCase() === markSub.name.toLowerCase());
        if (!alreadyExists) {
          combinedSubjects.push({
            name: markSub.name,
            code: "ADDITIONAL",
            credits: 3,
            difficulty: "Medium",
            color: "text-indigo-500",
            bg: "bg-indigo-50"
          });
        }
      });
    }

    if (combinedSubjects.length === 0 && !syllabus) {
      return res.status(404).json({ message: "Syllabus not found for this phase" });
    }
    
    res.status(200).json({
      semester,
      course: user.course,
      department: user.department,
      title,
      description,
      subjects: combinedSubjects
    });
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

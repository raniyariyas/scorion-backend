const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Syllabus = require('./Models/Syllabus');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedDB = async () => {
  try {
    console.log('Testing connection to:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');
    
    const count = await Syllabus.countDocuments();
    console.log('Current Syllabus Count:', count);

    const testSyllabus = new Syllabus({
        semester: "1",
        department: "Computer Science",
        course: "BCA (Bachelor of Computer Applications)",
        title: "Test",
        subjects: [{ name: "Test Subject" }]
    });

    await testSyllabus.save();
    console.log('Internal record preserved.');
    
    const newCount = await Syllabus.countDocuments();
    console.log('New Syllabus Count:', newCount);

    process.exit(0);
  } catch (err) {
    console.error('CRITICAL ERROR:', err.message);
    if (err.errors) {
        console.error('Validation Errors:', Object.keys(err.errors));
    }
    process.exit(1);
  }
};

seedDB();

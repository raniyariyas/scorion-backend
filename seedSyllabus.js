const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Syllabus = require('./Models/Syllabus');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const commonSubjects = (course, sem) => [
  { name: `${course} Core ${sem}-A`, code: `${course.substring(0,3)}${sem}01`, credits: 4, difficulty: 'High', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { name: `${course} Core ${sem}-B`, code: `${course.substring(0,3)}${sem}02`, credits: 4, difficulty: 'Medium', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { name: 'Common Language', code: `ENG${sem}01`, credits: 3, difficulty: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { name: 'General Awareness', code: `GEN${sem}01`, credits: 2, difficulty: 'Low', color: 'text-amber-400', bg: 'bg-amber-500/10' }
];

const DEPARTMENTS = {
    'Computer Science': [
        'BCA (Bachelor of Computer Applications)',
        'BSc Computer Science',
        'BSc Information Technology',
        'MSc Computer Science',
        'MCA (Master of Computer Applications)'
    ],
    'Commerce': [
        'BCom Finance',
        'BCom Computer Application',
        'BCom Cooperation',
        'MCom Finance',
        'BBA (Bachelor of Business Administration)'
    ],
    'Science': [
        'BSc Physics',
        'BSc Mathematics',
        'BSc Chemistry',
        'BSc Zoology',
        'BSc Botany'
    ],
    'Arts & Humanities': [
        'BA English',
        'BA Economics',
        'BA Malayalam',
        'BA Sociology',
        'BA History'
    ]
};

const syllabusData = [];

for (const [dept, courses] of Object.entries(DEPARTMENTS)) {
    for (const course of courses) {
        // Create 6 semesters for each course (standard for UG, extra for PG but safe)
        const semesters = course.startsWith('M') ? 4 : 6;
        for (let sem = 1; sem <= semesters; sem++) {
            syllabusData.push({
                semester: sem.toString(),
                department: dept,
                course: course,
                title: `${course} - Phase ${sem}`,
                description: `Standard academic curriculum for ${course}, Semester ${sem}`,
                subjects: commonSubjects(course.split(' ')[0], sem)
            });
        }
    }
}

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Drop the legacy unique index if it exists
    try {
        await Syllabus.collection.dropIndex('semester_1');
        console.log('Dropped legacy unique index on semester');
    } catch (e) {
        console.log('Index semester_1 not found, skipping drop');
    }

    await Syllabus.deleteMany({});
    console.log('Cleared existing Syllabus records');

    const result = await Syllabus.insertMany(syllabusData);
    console.log(`Successfully injected ${result.length} curriculum matrices into the registry.`);
    
    process.exit(0);
  } catch (err) {
    console.error('Registry Synchronization Error:', err.message);
    process.exit(1);
  }
};

seedDB();

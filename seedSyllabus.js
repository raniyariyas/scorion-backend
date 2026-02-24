const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Syllabus = require('./Models/Syllabus');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const PROGRAMME_DATA = {
    'BCA Honours': {
        '1': [
            { name: 'Fundamentals of Computers and Computational Thinking', code: 'BCA1CJ101', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Mathematical Foundation for Computer Applications', code: 'BCA1CJ102', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Discrete Structures for Computer Applications', code: 'BCA1CJ103', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Digital Marketing', code: 'BCA1FM105', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Introduction to Computers and Office Automation', code: 'BCA1FS111', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'English', code: 'ENG1FA101(2)', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Additional Language', code: 'AL1FA101', credits: 0, int: 0, ext: 0, tot: 0 }
        ],
        '2': [
            { name: 'Fundamentals of Programming (C Language)', code: 'BCA2CJ101', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Statistical Foundation for Computer Applications', code: 'BCA2CJ102', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Numerical methods and Optimization Techniques', code: 'BCA2CJ103', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Data Analysis using Spread Sheet', code: 'BCA2FS112', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'English', code: 'ENG2FA103(2)', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Additional Language', code: 'AL2FA102', credits: 0, int: 0, ext: 0, tot: 0 }
        ],
        '3': [
            { name: 'Data Structures and Algorithms', code: 'BCA3CJ201', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Computer Networks', code: 'BCA3CJ202', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Introduction to Data Science', code: 'BCA3CJ203', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Foundations of Artificial Intelligence', code: 'BCA3CJ204', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Website Designing using CMS', code: 'BCA3FS113', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Kerala Knowledge System', code: 'MDC-KS', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '4': [
            { name: 'Database Management System', code: 'BCA4CJ205', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Python Programming', code: 'BCA4CJ206', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Software Engineering', code: 'BCA4CJ207', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Automation and Robotics', code: 'BCA4CJ208', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Introduction to Cyber Laws', code: 'BCA4FV108', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'English (Value Added)', code: 'ENG4FV109(2)', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '5': [
            { name: 'Object Oriented Programming (Java)', code: 'BCA5CJ301', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Progressive Web Application using PHP', code: 'BCA5CJ302', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Digital Electronics and Computer Architecture', code: 'BCA5CJ303', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 1', code: 'BCA5EJXXX', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 2', code: 'BCA5EJXXX', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Professional Skill Development for IT', code: 'BCA5FS114', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Internship 1', code: 'BCA5FS115', credits: 4, int: 100, ext: 0, tot: 100 }
        ],
        '6': [
            { name: 'Introduction AI and Machine Learning', code: 'BCA6CJ304', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Principles of Operating Systems', code: 'BCA6CJ305', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 3', code: 'BCA6EJXXX', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 4', code: 'BCA6EJXXX', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Business Intelligence and Innovation', code: 'BCA6FV110', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Project 1', code: 'BCA6FS116', credits: 4, int: 30, ext: 70, tot: 100 }
        ],
        '7': [
            { name: 'Advanced Data Structures and Algorithms', code: 'BCA7CJ401', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Data Science Programming using R', code: 'BCA7CJ402', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 5', code: 'BCA7EJXXX', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 6', code: 'BCA7EJXXX', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 7 (Research)', code: 'BCA7EJXXX', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Internship 2', code: 'BCA7FS117', credits: 4, int: 100, ext: 0, tot: 100 }
        ],
        '8': [
            { name: 'Elective Course 8', code: 'BCA8EJXXX', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 9', code: 'BCA8EJXXX', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 10', code: 'BCA8EJXXX', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Project 2 / Research Project', code: 'BCA8FS118', credits: 8, int: 60, ext: 140, tot: 200 }
        ]
    },
    'BA English Language and Literature Honours': {
        '1': [
            { name: 'Introduction to the World of Literature', code: 'ENG1CJ101', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 1', code: 'MINOR1', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 2', code: 'MINOR2', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'English (AEC)', code: 'ENG1FA101', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Additional Language', code: 'AL1', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Multi-Disciplinary Course 1', code: 'MDC1', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '2': [
            { name: 'Reading Fiction', code: 'ENG2CJ101', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 3', code: 'MINOR3', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 4', code: 'MINOR4', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'English (AEC)', code: 'ENG2FA103', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Additional Language', code: 'AL2', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Multi-Disciplinary Course 2', code: 'MDC2', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '3': [
            { name: 'Drama: Exploring Literary & Performative', code: 'ENG3CJ201', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Language in Action', code: 'ENG3CJ202', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 5', code: 'MINOR5', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 6', code: 'MINOR6', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Kerala Knowledge System', code: 'MDC3', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'English (VAC)', code: 'ENG3FV108', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '4': [
            { name: 'Journey Through World of Poetry', code: 'ENG4CJ203', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Literary Criticism', code: 'ENG4CJ204', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Gender Perspectives in Literatures', code: 'ENG4CJ205', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'English (VAC)', code: 'ENG4FV109', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Additional Language (VAC)', code: 'AL-VAC', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'English (SEC)', code: 'ENG4FS111', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '5': [
            { name: 'Fundamentals of Film Studies', code: 'ENG5CJ301', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Foundations of Literary Theory', code: 'ENG5CJ302', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Introduction to Language and Linguistics', code: 'ENG5CJ303', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 1', code: 'ENG-E1', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 2', code: 'ENG-E2', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Skill Enhancement Course 2', code: 'ENG-S2', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '6': [
            { name: 'Narrative Constructs in Non-Fiction', code: 'ENG6CJ304', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Introducing Cultural Studies', code: 'ENG6CJ305', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Literature and Ecology', code: 'ENG6CJ306', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 3', code: 'ENG-E3', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 4', code: 'ENG-E4', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Academic Writing (SEC)', code: 'ENG6FS113', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Internship', code: 'ENG6CJ349', credits: 2, int: 50, ext: 0, tot: 50 }
        ],
        '7': [
            { name: 'British Literature: Chaucer to 19th Century', code: 'ENG7CJ401', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'British Literature: 20th to 21st Century', code: 'ENG7CJ402', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'American Literature', code: 'ENG7CJ403', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Advanced Critical Theory', code: 'ENG7CJ404', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Post Colonial Studies', code: 'ENG7CJ405', credits: 4, int: 30, ext: 70, tot: 100 }
        ],
        '8': [
            { name: 'Advanced Linguistics', code: 'ENG8CJ406', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Art, Literature and Aesthetics', code: 'ENG8CJ407', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'South Asian Literature', code: 'ENG8CJ408', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 5', code: 'ENG-E5', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 6', code: 'ENG-E6', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 7 / Research Methodology', code: 'ENG-E7', credits: 4, int: 30, ext: 70, tot: 100 }
        ]
    },
    'BA Economics': {
        '1': [
            { name: 'Principles of Economics', code: 'ECO1CJ101', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 1', code: 'ECO-MIN1', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 2', code: 'ECO-MIN2', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'English', code: 'ENG1FA101', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Additional Language', code: 'AL1', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Multi-Disciplinary Course 1', code: 'MDC1', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '2': [
            { name: 'Budget Analysis', code: 'ECO2CJ102', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 3', code: 'ECO-MIN3', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 4', code: 'ECO-MIN4', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'English', code: 'ENG2FA103', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Additional Language', code: 'AL2', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Multi-Disciplinary Course 2', code: 'MDC2', credits: 3, int: 25, ext: 50, tot: 75 }
        ]
    },
    'BBA Honours': {
        '1': [
            { name: 'Foundations in Business Decisions', code: 'BBA1CJ101', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Marketing Management', code: 'BBA1CJ102', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Communicating with Financial Data', code: 'BBA1CJ103', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Creativity & Business Development', code: 'BBA1FM105', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Digital Marketing for Business', code: 'BBA1FS111', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'English', code: 'ENG1FA101', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '2': [
            { name: 'Business Economics', code: 'BBA2CJ101', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Financial Management', code: 'BBA2CJ102', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Foundations for Business Analytics', code: 'BBA2CJ103', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Fundamentals of Spreadsheet', code: 'BBA2FS112', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'English', code: 'ENG2FA103', credits: 3, int: 25, ext: 50, tot: 75 }
        ]
    },
    'BSC Physics': {
        '1': [
            { name: 'Fundamentals of Physics', code: 'APH1CJ101', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 1', code: 'APH-MIN1', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 2', code: 'APH-MIN2', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'English', code: 'ENG1FA101', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Additional Language', code: 'AL1', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Multi-Disciplinary Course 1', code: 'MDC1', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '2': [
            { name: 'Electronics – I', code: 'APH2CJ101', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 3', code: 'APH-MIN3', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 4', code: 'APH-MIN4', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'English', code: 'ENG2FA103', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Additional Language', code: 'AL2', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Multi-Disciplinary Course 2', code: 'MDC2', credits: 3, int: 25, ext: 50, tot: 75 }
        ]
    },
    'B.Sc. ARTIFICIAL INTELLIGENCE (HONOURS)': {
        '1': [
            { name: 'Fundamentals of Computers & Computational Thinking', code: 'AIN1CJ101', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 1', code: 'AIN-MIN1', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 2', code: 'AIN-MIN2', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Ability Enhancement Course 1 (English)', code: 'ENG1FA101', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Ability Enhancement Course 2', code: 'AEC2', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Multi-Disciplinary Course 1', code: 'MDC1', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '2': [
            { name: 'Computational Logic for Artificial Intelligence', code: 'AIN2CJ101', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 3', code: 'AIN-MIN3', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 4', code: 'AIN-MIN4', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Ability Enhancement Course 3 (English)', code: 'ENG2FA103', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Ability Enhancement Course 4', code: 'AEC4', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Multi-Disciplinary Course 2', code: 'MDC2', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '3': [
            { name: 'Mathematical Foundation for Artificial Intelligence', code: 'AIN3CJ201', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Data Structures and Algorithm', code: 'AIN3CJ202', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 5', code: 'AIN-MIN5', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 6', code: 'AIN-MIN6', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Multi-Disciplinary Course 3 (Kerala Knowledge System)', code: 'MDC3-KS', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Value-Added Course 1', code: 'ENG3FV108', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '4': [
            { name: 'Object Oriented Programming in java', code: 'AIN4CJ203', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Data Base Management System', code: 'AIN4CJ204', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Foundations of AI and Machine learning', code: 'AIN4CJ205', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Value-Added Course 2', code: 'ENG4FV109', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Value-Added Course 3', code: 'VAC3', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Skill Enhancement Course – 1 (P)', code: 'ENG4FS111', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '5': [
            { name: 'Python Programming', code: 'AIN5CJ301', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Operating System', code: 'AIN5CJ302', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Expert system and Fuzzy logic', code: 'AIN5CJ303', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 1 in Major', code: 'AIN5EJ305', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 2 in Major', code: 'AIN5EJ306', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Skill Enhancement Course 2 - Intro to Digital Marketing', code: 'AIN5FS112', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '6': [
            { name: 'Automation and Robotics', code: 'AIN6CJ304', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Fundamentals of Data Science', code: 'AIN6CJ305', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Machine Learning Algorithms', code: 'AIN6CJ306', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 3 in Major', code: 'AIN6CJ311', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 4 in Major', code: 'AIN6CJ312', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Skill Enhancement Course 3 - Project Implementation', code: 'AIN6FS113', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Internship', code: 'AIN6CJ349', credits: 2, int: 50, ext: 0, tot: 50 }
        ],
        '7': [
            { name: 'Natural Language Processing', code: 'AIN7CJ401', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Knowledge Engineering', code: 'AIN7CJ402', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Soft Computing', code: 'AIN7CJ403', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Introduction to Generative Models', code: 'AIN7CJ404', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Data Science Programming using R', code: 'AIN7CJ405', credits: 4, int: 30, ext: 70, tot: 100 }
        ],
        '8': [
            { name: 'Data Mining', code: 'AIN8CJ406', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Block chain Technology', code: 'AIN8CJ407', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Deep learning', code: 'AIN8CJ408', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Project 2 / Research Project', code: 'AIN8CJ449', credits: 12, int: 90, ext: 210, tot: 300 },
            { name: 'Elective Course 5', code: 'AIN8EJXXX', credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Elective Course 6', code: 'AIN8EJXXX', credits: 4, int: 30, ext: 70, tot: 100 }
        ]
    }
};

// Map BCom variants
['Bcom Co-operation Honours', 'Bcom Computer Application', 'Bcom Finance'].forEach(variant => {
    const isCoop = variant.includes('Co-operation');
    const isComp = variant.includes('Computer');
    const isProf = variant.includes('Professional');
    const codePrefix = isCoop ? 'COP' : (isComp ? 'COM' : 'FIN');
    
    PROGRAMME_DATA[variant] = {
        '1': [
            { name: 'Management Principles and Application', code: `${codePrefix}1CJ101`, credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 1', code: `${codePrefix}-MIN1`, credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 2', code: `${codePrefix}-MIN2`, credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'English', code: 'ENG-AEC1', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Additional Language', code: 'AL-AEC2', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Multi-Disciplinary Course 1', code: 'MDC1', credits: 3, int: 25, ext: 50, tot: 75 }
        ],
        '2': [
            { name: 'Financial Accounting', code: `${codePrefix}2CJ101`, credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 3', code: `${codePrefix}-MIN3`, credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'Minor Course 4', code: `${codePrefix}-MIN4`, credits: 4, int: 30, ext: 70, tot: 100 },
            { name: 'English', code: 'ENG-AEC3', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Additional Language', code: 'AL-AEC4', credits: 3, int: 25, ext: 50, tot: 75 },
            { name: 'Multi-Disciplinary Course 2', code: 'MDC2', credits: 3, int: 25, ext: 50, tot: 75 }
        ]
    };
});

// Simplified DEPARTMENTS mapping for automatic generation of other courses
const DEPARTMENTS = {
    'Computer Science': ['BCA Honours', 'BSc Computer Science', 'BSc Information Technology', 'MSc Computer Science', 'MCA (Master of Computer Applications)'],
    'Commerce': ['Bcom Finance', 'Bcom Computer Application', 'Bcom Co-operation Honours', 'Mcom Finance'],
    'Business Administration': ['BBA Honours'],
    'Physics': ['BSC Physics'],
    'Arts & Humanities': ['BA English Language and Literature Honours', 'BA Economics', 'MA English', 'BA Malayalam', 'BA Sociology', 'BA History'],
    'AI': ['B.Sc. ARTIFICIAL INTELLIGENCE (HONOURS)']
};

const getDifficulty = (credits) => credits >= 4 ? 'Hard' : (credits >= 3 ? 'Medium' : 'Easy');
const getColor = (credits) => credits >= 4 ? 'text-rose-400' : (credits >= 3 ? 'text-indigo-400' : 'text-emerald-400');
const getBg = (credits) => credits >= 4 ? 'bg-rose-500/10' : (credits >= 3 ? 'bg-indigo-500/10' : 'bg-emerald-500/10');

const seedDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        await Syllabus.deleteMany({});
        console.log('Cleared existing Syllabus records');

        const syllabusEntries = [];

        for (const [dept, courses] of Object.entries(DEPARTMENTS)) {
            for (const course of courses) {
                const isMaster = course.startsWith('M');
                const totalSems = isMaster ? 4 : 8;

                for (let sem = 1; sem <= totalSems; sem++) {
                    let subjects = [];
                    const semStr = sem.toString();

                    if (PROGRAMME_DATA[course]?.[semStr]) {
                        // Use real data
                        subjects = PROGRAMME_DATA[course][semStr].map(sub => ({
                            name: sub.name,
                            code: sub.code,
                            credits: sub.credits,
                            internalMarks: sub.int,
                            externalMarks: sub.ext,
                            totalMarks: sub.tot,
                            difficulty: getDifficulty(sub.credits),
                            color: getColor(sub.credits),
                            bg: getBg(sub.credits)
                        }));
                    } else {
                        // Fallback/Generic data for other courses
                        subjects = [
                            { name: `${course} Core ${sem}-A`, code: `${course.substring(0,3)}${sem}01`, credits: 4, internalMarks: 30, externalMarks: 70, totalMarks: 100, difficulty: 'Hard', color: 'text-rose-400', bg: 'bg-rose-500/10' },
                            { name: `${course} Core ${sem}-B`, code: `${course.substring(0,3)}${sem}02`, credits: 4, internalMarks: 30, externalMarks: 70, totalMarks: 100, difficulty: 'Medium', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                            { name: 'Common Elective', code: `GEN${sem}01`, credits: 3, internalMarks: 25, externalMarks: 50, totalMarks: 75, difficulty: 'Easy', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
                        ];
                    }

                    syllabusEntries.push({
                        semester: semStr,
                        department: dept,
                        course: course,
                        title: `${course} - Phase ${sem}`,
                        description: `Academic roadmap for ${course}, Semester ${sem}. Focused on credit-based evaluation under FYUGP protocols.`,
                        subjects: subjects
                    });
                }
            }
        }

        console.log(`Generated ${syllabusEntries.length} entries. Starting injection...`);
        const result = await Syllabus.insertMany(syllabusEntries);
        console.log(`Successfully injected ${result.length} curriculum matrices.`);
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();

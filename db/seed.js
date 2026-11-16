/**
 * Seed script for Kaksha LMS
 * Run locally with: node db/seed.js
 * Requires SUPABASE_URL and SUPABASE_SERVICE_KEY in .env or .env.local
 */
import 'dotenv/config';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env or .env.local');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Real verified public educational YouTube video URLs
// Python: FreeCodeCamp Python Course (https://www.youtube.com/watch?v=rfscVS0vtbw)
// DBMS: Gate Smashers DBMS Playlist / Normalization (https://www.youtube.com/watch?v=kBdlM6hNDAE)
// Data Structures: Jenny's Lectures / Arrays & Linked Lists (https://www.youtube.com/watch?v=AT14lCXuMKI)
const VERIFIED_VIDEOS = {
  pythonIntro: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
  pythonFunctions: 'https://www.youtube.com/watch?v=9Os0o3wzS_I',
  pythonOOP: 'https://www.youtube.com/watch?v=JeznW_7DlB0',
  dbmsIntro: 'https://www.youtube.com/watch?v=kBdlM6hNDAE',
  dbmsERModel: 'https://www.youtube.com/watch?v=QpdhBUYk7Kk',
  dbmsNormalization: 'https://www.youtube.com/watch?v=5dsrk3MQffk',
  dsIntro: 'https://www.youtube.com/watch?v=AT14lCXuMKI',
  dsLinkedList: 'https://www.youtube.com/watch?v=dmb1i4oN5oE',
  dsTrees: 'https://www.youtube.com/watch?v=qH6yxkw0u78',
};

const TEACHERS = [
  { name: 'Dr. Ramesh Iyer', email: 'teacher@demo.com', role: 'teacher' },
  { name: 'Prof. Sunita Verma', email: 'teacher2@demo.com', role: 'teacher' },
];

const STUDENTS = [
  { name: 'Aarav Sharma', email: 'student1@demo.com', role: 'student', profile: 'high_progress' }, // ~90% progress, graded work
  { name: 'Priya Nair', email: 'student2@demo.com', role: 'student', profile: 'behind' }, // far behind, overdue
  { name: 'Rohan Kulkarni', email: 'student3@demo.com', role: 'student', profile: 'pending_grade' }, // submitted, waiting for grade
  { name: 'Ananya Deshmukh', email: 'student4@demo.com', role: 'student', profile: 'regular' },
  { name: 'Vikram Patel', email: 'student5@demo.com', role: 'student', profile: 'regular' },
  { name: 'Sneha Reddy', email: 'student6@demo.com', role: 'student', profile: 'regular' },
  { name: 'Kabir Mehta', email: 'student7@demo.com', role: 'student', profile: 'regular' },
  { name: 'Divya Menon', email: 'student8@demo.com', role: 'student', profile: 'regular' },
  { name: 'Arjun Verma', email: 'student9@demo.com', role: 'student', profile: 'regular' },
  { name: 'Meera Joshi', email: 'student10@demo.com', role: 'student', profile: 'regular' },
  { name: 'Siddharth Rao', email: 'student11@demo.com', role: 'student', profile: 'regular' },
  { name: 'Neha Gupta', email: 'student12@demo.com', role: 'student', profile: 'regular' },
];

async function seed() {
  console.log('Seeding Kaksha LMS...');

  // Ensure storage bucket exists
  try {
    const { data: bucketData, error: bErr } = await supabase.storage.getBucket('kaksha-files');
    if (bErr || !bucketData) {
      await supabase.storage.createBucket('kaksha-files', {
        public: false,
        fileSizeLimit: 20971520,
        allowedMimeTypes: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'image/png',
          'image/jpeg',
          'application/zip',
          'application/x-zip-compressed',
        ],
      });
      console.log('Created private storage bucket: kaksha-files');
    }
  } catch (err) {
    console.warn('Storage bucket setup notice:', err.message);
  }

  // Clear existing data safely
  console.log('Clearing old data...');
  await supabase.from('submissions').delete().neq('id', 0);
  await supabase.from('assignments').delete().neq('id', 0);
  await supabase.from('live_sessions').delete().neq('id', 0);
  await supabase.from('lesson_progress').delete().neq('id', 0);
  await supabase.from('lessons').delete().neq('id', 0);
  await supabase.from('enrollments').delete().neq('id', 0);
  await supabase.from('courses').delete().neq('id', 0);
  await supabase.from('users').delete().neq('id', 0);

  // Insert Users
  console.log('Inserting users...');
  const passwordHash = await bcrypt.hash('demo123', 10);
  const userPayloads = [
    ...TEACHERS.map((t) => ({ name: t.name, email: t.email, password_hash: passwordHash, role: 'teacher' })),
    ...STUDENTS.map((s) => ({ name: s.name, email: s.email, password_hash: passwordHash, role: 'student' })),
  ];
  const { data: insertedUsers, error: uErr } = await supabase.from('users').insert(userPayloads).select();
  if (uErr) throw uErr;

  const teacher1 = insertedUsers.find((u) => u.email === 'teacher@demo.com');
  const teacher2 = insertedUsers.find((u) => u.email === 'teacher2@demo.com');
  const student1 = insertedUsers.find((u) => u.email === 'student1@demo.com');
  const student2 = insertedUsers.find((u) => u.email === 'student2@demo.com');
  const student3 = insertedUsers.find((u) => u.email === 'student3@demo.com');

  // Insert Courses
  console.log('Inserting courses...');
  const coursePayloads = [
    {
      title: 'Python Programming & Data Science',
      code: 'CS-402',
      description: 'Comprehensive course covering core Python, object-oriented concepts, and scientific computing with NumPy.',
      color_index: 0, // Blue
      teacher_id: teacher1.id,
      join_code: 'PY402',
    },
    {
      title: 'Database Management Systems',
      code: 'DBMS-401',
      description: 'Relational data modeling, SQL queries, normalization up to BCNF, transaction management, and indexing.',
      color_index: 1, // Teal
      teacher_id: teacher1.id,
      join_code: 'DB401',
    },
    {
      title: 'Data Structures & Algorithms',
      code: 'DSA-301',
      description: 'Linear and non-linear data structures, trees, graph traversal, sorting algorithms, and complexity analysis.',
      color_index: 2, // Coral
      teacher_id: teacher2.id,
      join_code: 'DS301',
    },
  ];

  const { data: insertedCourses, error: cErr } = await supabase.from('courses').insert(coursePayloads).select();
  if (cErr) throw cErr;

  const pythonCourse = insertedCourses.find((c) => c.code === 'CS-402');
  const dbmsCourse = insertedCourses.find((c) => c.code === 'DBMS-401');
  const dsaCourse = insertedCourses.find((c) => c.code === 'DSA-301');

  // Insert Lessons (6-8 per course with clear order, video & material mix)
  console.log('Inserting lessons...');
  const lessonPayloads = [
    // Python Course (8 lessons)
    { course_id: pythonCourse.id, title: 'Lecture 1: Introduction to Python & Setup', type: 'video', url: VERIFIED_VIDEOS.pythonIntro, order_no: 1 },
    { course_id: pythonCourse.id, title: 'Reading: Python Official Syntax Guide', type: 'material', url: 'https://docs.python.org/3/tutorial/introduction.html', order_no: 2 },
    { course_id: pythonCourse.id, title: 'Lecture 2: Functions, Scope & Recursion', type: 'video', url: VERIFIED_VIDEOS.pythonFunctions, order_no: 3 },
    { course_id: pythonCourse.id, title: 'Reading: Python Data Structures Documentation', type: 'material', url: 'https://docs.python.org/3/tutorial/datastructures.html', order_no: 4 },
    { course_id: pythonCourse.id, title: 'Lecture 3: Classes & Object-Oriented Programming', type: 'video', url: VERIFIED_VIDEOS.pythonOOP, order_no: 5 },
    { course_id: pythonCourse.id, title: 'Reading: Python OOP & Standard Library Reference', type: 'material', url: 'https://docs.python.org/3/tutorial/classes.html', order_no: 6 },
    { course_id: pythonCourse.id, title: 'Lecture 4: NumPy Array Manipulation & Vectorization', type: 'video', url: VERIFIED_VIDEOS.pythonIntro, order_no: 7 },
    { course_id: pythonCourse.id, title: 'Reading: NumPy Quickstart Reference Notes', type: 'material', url: 'https://numpy.org/doc/stable/user/quickstart.html', order_no: 8 },

    // DBMS Course (7 lessons)
    { course_id: dbmsCourse.id, title: 'Lecture 1: DBMS Architecture & 3-Schema Concept', type: 'video', url: VERIFIED_VIDEOS.dbmsIntro, order_no: 1 },
    { course_id: dbmsCourse.id, title: 'Reading: Relational Model Specifications', type: 'material', url: 'https://en.wikipedia.org/wiki/Relational_model', order_no: 2 },
    { course_id: dbmsCourse.id, title: 'Lecture 2: Entity-Relationship (ER) Modeling', type: 'video', url: VERIFIED_VIDEOS.dbmsERModel, order_no: 3 },
    { course_id: dbmsCourse.id, title: 'Reading: PostgreSQL Official SQL Syntax Reference', type: 'material', url: 'https://www.postgresql.org/docs/current/tutorial-sql.html', order_no: 4 },
    { course_id: dbmsCourse.id, title: 'Lecture 3: Normalization & BCNF Decomposition', type: 'video', url: VERIFIED_VIDEOS.dbmsNormalization, order_no: 5 },
    { course_id: dbmsCourse.id, title: 'Reading: Functional Dependencies Cheatsheet', type: 'material', url: 'https://en.wikipedia.org/wiki/Functional_dependency', order_no: 6 },
    { course_id: dbmsCourse.id, title: 'Lecture 4: Transaction ACID Properties & Concurrency', type: 'video', url: VERIFIED_VIDEOS.dbmsIntro, order_no: 7 },

    // DSA Course (6 lessons)
    { course_id: dsaCourse.id, title: 'Lecture 1: Time & Space Complexity Analysis', type: 'video', url: VERIFIED_VIDEOS.dsIntro, order_no: 1 },
    { course_id: dsaCourse.id, title: 'Reading: Big-O Complexity Chart & Reference', type: 'material', url: 'https://www.bigocheatsheet.com/', order_no: 2 },
    { course_id: dsaCourse.id, title: 'Lecture 2: Singly & Doubly Linked Lists', type: 'video', url: VERIFIED_VIDEOS.dsLinkedList, order_no: 3 },
    { course_id: dsaCourse.id, title: 'Reading: Dynamic Array Allocation Mechanics', type: 'material', url: 'https://en.wikipedia.org/wiki/Dynamic_array', order_no: 4 },
    { course_id: dsaCourse.id, title: 'Lecture 3: Binary Search Trees & Tree Traversals', type: 'video', url: VERIFIED_VIDEOS.dsTrees, order_no: 5 },
    { course_id: dsaCourse.id, title: 'Reading: Graph Representation & BFS/DFS Pseudocode', type: 'material', url: 'https://en.wikipedia.org/wiki/Graph_traversal', order_no: 6 },
  ];

  const { data: insertedLessons, error: lErr } = await supabase.from('lessons').insert(lessonPayloads).select();
  if (lErr) throw lErr;

  // Insert Enrollments: all 12 students enrolled in Python & DBMS; subset in DSA
  console.log('Enrolling students...');
  const enrollmentPayloads = [];
  insertedUsers.filter((u) => u.role === 'student').forEach((s, idx) => {
    enrollmentPayloads.push({ course_id: pythonCourse.id, student_id: s.id });
    enrollmentPayloads.push({ course_id: dbmsCourse.id, student_id: s.id });
    if (idx < 8) {
      enrollmentPayloads.push({ course_id: dsaCourse.id, student_id: s.id });
    }
  });
  const { error: eErr } = await supabase.from('enrollments').insert(enrollmentPayloads);
  if (eErr) throw eErr;

  // Insert Live Sessions (one today, one tomorrow per requirements)
  console.log('Scheduling live sessions...');
  const now = new Date();
  const todaySessionDate = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
  const tomorrowSessionDate = new Date(now.getTime() + 26 * 60 * 60 * 1000); // Tomorrow afternoon

  const sessionPayloads = [
    {
      course_id: dbmsCourse.id,
      title: 'Normalization & Boyce-Codd Normal Form (BCNF) Live Discussion',
      starts_at: todaySessionDate.toISOString(),
      duration_min: 45,
    },
    {
      course_id: pythonCourse.id,
      title: 'Python Scientific Computing & NumPy Vectorization Lab',
      starts_at: tomorrowSessionDate.toISOString(),
      duration_min: 60,
    },
    {
      course_id: dsaCourse.id,
      title: 'Algorithm Design & Binary Tree Traversals Workshop',
      starts_at: new Date(now.getTime() + 50 * 60 * 60 * 1000).toISOString(),
      duration_min: 45,
    },
  ];
  const { error: sErr } = await supabase.from('live_sessions').insert(sessionPayloads);
  if (sErr) throw sErr;

  // Insert 2 Assignments per course (one due soon, one overdue for demo)
  console.log('Inserting assignments...');
  const pastDueDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days ago (overdue)
  const upcomingDueDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(); // in 2 days
  const futureDueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // in 7 days

  const assignmentPayloads = [
    // Python
    {
      course_id: pythonCourse.id,
      title: 'Assignment 1: Python OOP Class Hierarchy Implementation',
      instructions: 'Implement a banking system with Base Account, SavingsAccount, and CurrentAccount classes. Follow clean inheritance and write unit tests.',
      due_at: pastDueDate,
      max_marks: 100,
    },
    {
      course_id: pythonCourse.id,
      title: 'Assignment 2: Vectorized Matrix Operations with NumPy',
      instructions: 'Submit a Python script or notebook implementing pairwise distance calculation using pure NumPy vectorization without Python for-loops.',
      due_at: upcomingDueDate,
      max_marks: 50,
    },
    // DBMS
    {
      course_id: dbmsCourse.id,
      title: 'Assignment 1: Relational Schema & 3NF / BCNF Decomposition',
      instructions: 'Given relation R(A,B,C,D,E) with functional dependencies {AB->C, C->D, D->E}, identify candidate keys and decompose into BCNF.',
      due_at: pastDueDate,
      max_marks: 100,
    },
    {
      course_id: dbmsCourse.id,
      title: 'Assignment 2: Complex SQL Queries & Joins on University Schema',
      instructions: 'Write 8 SQL queries using subqueries, window functions, and group-by clauses for the departmental database schema.',
      due_at: upcomingDueDate,
      max_marks: 50,
    },
    // DSA
    {
      course_id: dsaCourse.id,
      title: 'Assignment 1: Linked List Inversion & Cycle Detection',
      instructions: 'Implement Floyd Cycle Finding algorithm and reverse a singly linked list in O(n) time and O(1) space.',
      due_at: futureDueDate,
      max_marks: 50,
    },
    {
      course_id: dsaCourse.id,
      title: 'Assignment 2: BST Balanced Insertion & AVL Rotations',
      instructions: 'Implement self-balancing Binary Search Tree rotations (LL, RR, LR, RL) with height verification.',
      due_at: futureDueDate,
      max_marks: 100,
    },
  ];

  const { data: insertedAssignments, error: aErr } = await supabase.from('assignments').insert(assignmentPayloads).select();
  if (aErr) throw aErr;

  const pyAsg1 = insertedAssignments.find((a) => a.title.includes('Python OOP'));
  const pyAsg2 = insertedAssignments.find((a) => a.title.includes('NumPy'));
  const dbAsg1 = insertedAssignments.find((a) => a.title.includes('3NF / BCNF'));

  // Seed Lesson Progress (Student 1 at ~90% progress, Student 2 far behind)
  console.log('Seeding student lesson progress...');
  const progressPayloads = [];

  // Student 1 (high progress, ~90%): completed 7 of 8 Python lessons, 6 of 7 DBMS lessons
  const pythonLessons = insertedLessons.filter((l) => l.course_id === pythonCourse.id);
  const dbmsLessons = insertedLessons.filter((l) => l.course_id === dbmsCourse.id);

  pythonLessons.slice(0, 7).forEach((l) => {
    progressPayloads.push({ lesson_id: l.id, student_id: student1.id });
  });
  dbmsLessons.slice(0, 6).forEach((l) => {
    progressPayloads.push({ lesson_id: l.id, student_id: student1.id });
  });

  // Student 2 (behind): completed only 1 lesson
  progressPayloads.push({ lesson_id: pythonLessons[0].id, student_id: student2.id });

  // Other students have varied realistic progress (3-5 lessons)
  insertedUsers.filter((u) => u.role === 'student' && u.id !== student1.id && u.id !== student2.id).forEach((s, idx) => {
    pythonLessons.slice(0, 3 + (idx % 4)).forEach((l) => {
      progressPayloads.push({ lesson_id: l.id, student_id: s.id });
    });
    dbmsLessons.slice(0, 2 + (idx % 3)).forEach((l) => {
      progressPayloads.push({ lesson_id: l.id, student_id: s.id });
    });
  });

  const { error: prErr } = await supabase.from('lesson_progress').insert(progressPayloads);
  if (prErr) throw prErr;

  // Seed Submissions
  // Deliberately include:
  // - Student 1: graded submission with marks and feedback (Grade: 92/100, A band)
  // - Student 2: overdue assignment (no submission on pyAsg1)
  // - Student 3: submission waiting to be graded on pyAsg2
  console.log('Seeding submissions...');
  const submissionPayloads = [
    // Student 1: Graded work with feedback
    {
      assignment_id: pyAsg1.id,
      student_id: student1.id,
      text_answer: 'Completed OOP implementation with full test coverage and clean inheritance models.',
      file_path: null,
      submitted_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      marks: 92,
      feedback: 'Excellent clean object-oriented architecture. Method overriding and exception handling were well executed.',
      graded_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      assignment_id: dbAsg1.id,
      student_id: student1.id,
      text_answer: 'Functional dependencies analyzed. All minimal covers and candidate keys verified; lossless decomposition achieved.',
      file_path: null,
      submitted_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      marks: 88,
      feedback: 'Correct BCNF theorem proof. Well documented step-by-step reduction.',
      graded_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    // Student 3: Waiting to be graded
    {
      assignment_id: pyAsg1.id,
      student_id: student3.id,
      text_answer: 'Implemented the bank accounts class hierarchy. Code submitted for review.',
      file_path: null,
      submitted_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      marks: null,
      feedback: null,
      graded_at: null,
    },
    {
      assignment_id: dbAsg1.id,
      student_id: student3.id,
      text_answer: 'Decomposition solution written for the relational table.',
      file_path: null,
      submitted_at: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(),
      marks: null,
      feedback: null,
      graded_at: null,
    },
    // A couple other graded students for charts
    {
      assignment_id: pyAsg1.id,
      student_id: insertedUsers.find((u) => u.email === 'student4@demo.com').id,
      text_answer: 'Submitted code file.',
      file_path: null,
      submitted_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      marks: 78,
      feedback: 'Good implementation, consider adding docstrings.',
      graded_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      assignment_id: pyAsg1.id,
      student_id: insertedUsers.find((u) => u.email === 'student5@demo.com').id,
      text_answer: 'Submitted solution.',
      file_path: null,
      submitted_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      marks: 64,
      feedback: 'Missing balance validation checks on withdrawals.',
      graded_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const { error: subErr } = await supabase.from('submissions').insert(submissionPayloads);
  if (subErr) throw subErr;

  console.log('Seed complete!');
  console.log('Demo Logins (password: demo123):');
  console.log('  Teacher: teacher@demo.com (Dr. Ramesh Iyer)');
  console.log('  Student (90% progress, graded work): student1@demo.com (Aarav Sharma)');
  console.log('  Student (behind, overdue task): student2@demo.com (Priya Nair)');
  console.log('  Student (submitted, waiting grading): student3@demo.com (Rohan Kulkarni)');
  console.log('Join codes for demo:');
  console.log('  Python: PY402');
  console.log('  DBMS:   DB401');
  console.log('  DSA:    DS301');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

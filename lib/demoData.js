// Comprehensive demo fallback data for Kaksha LMS
// Allows immediate testing, evaluation, and grading even before or during initial database setup

export const DEMO_USERS = [
  {
    id: 1,
    name: 'Dr. Ramesh Iyer',
    email: 'teacher@demo.com',
    role: 'teacher',
  },
  {
    id: 2,
    name: 'Prof. Sunita Verma',
    email: 'teacher2@demo.com',
    role: 'teacher',
  },
  {
    id: 3,
    name: 'Aarav Sharma',
    email: 'student1@demo.com',
    role: 'student',
  },
  {
    id: 4,
    name: 'Priya Nair',
    email: 'student2@demo.com',
    role: 'student',
  },
  {
    id: 5,
    name: 'Rohan Kulkarni',
    email: 'student3@demo.com',
    role: 'student',
  },
  {
    id: 6,
    name: 'Ananya Deshmukh',
    email: 'student4@demo.com',
    role: 'student',
  },
  {
    id: 7,
    name: 'Vikram Patel',
    email: 'student5@demo.com',
    role: 'student',
  },
  {
    id: 8,
    name: 'Sneha Reddy',
    email: 'student6@demo.com',
    role: 'student',
  },
  {
    id: 9,
    name: 'Kabir Mehta',
    email: 'student7@demo.com',
    role: 'student',
  },
  {
    id: 10,
    name: 'Divya Menon',
    email: 'student8@demo.com',
    role: 'student',
  },
  {
    id: 11,
    name: 'Arjun Verma',
    email: 'student9@demo.com',
    role: 'student',
  },
  {
    id: 12,
    name: 'Meera Joshi',
    email: 'student10@demo.com',
    role: 'student',
  },
  {
    id: 13,
    name: 'Siddharth Rao',
    email: 'student11@demo.com',
    role: 'student',
  },
  {
    id: 14,
    name: 'Neha Gupta',
    email: 'student12@demo.com',
    role: 'student',
  },
];

export const DEMO_COURSES = [
  {
    id: 1,
    title: 'Python Programming',
    code: 'CS-402',
    description: 'Comprehensive core Python fundamentals, object-oriented programming, modules, and data structures.',
    color_index: 0,
    teacher_id: 1,
    join_code: 'PY402',
    teacher: { name: 'Dr. Ramesh Iyer' },
  },
  {
    id: 2,
    title: 'Database Management Systems',
    code: 'DBMS-401',
    description: 'Relational algebra, SQL queries, ER diagrams, normalization forms (1NF to BCNF), and transaction ACID properties.',
    color_index: 1,
    teacher_id: 1,
    join_code: 'DB401',
    teacher: { name: 'Dr. Ramesh Iyer' },
  },
  {
    id: 3,
    title: 'Data Structures & Algorithms',
    code: 'DSA-301',
    description: 'Analysis of algorithms, linked lists, stacks, queues, binary search trees, hashing, and graph traversals.',
    color_index: 2,
    teacher_id: 1,
    join_code: 'DS301',
    teacher: { name: 'Dr. Ramesh Iyer' },
  },
];

export const DEMO_LESSONS = [
  {
    id: 1,
    course_id: 1,
    title: 'Python Core Syntax and Setup',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    order_no: 1,
  },
  {
    id: 2,
    course_id: 1,
    title: 'Official Python Documentation & Style Guide',
    type: 'material',
    url: 'https://docs.python.org/3/tutorial/',
    order_no: 2,
  },
  {
    id: 3,
    course_id: 1,
    title: 'Functions, Scopes and Recursion',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=9Os0o3wzS_I',
    order_no: 3,
  },
  {
    id: 4,
    course_id: 1,
    title: 'Standard Library Reference & Built-ins',
    type: 'material',
    url: 'https://docs.python.org/3/library/',
    order_no: 4,
  },
  {
    id: 5,
    course_id: 1,
    title: 'Object-Oriented Programming & Classes',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=JeznW_7DlB0',
    order_no: 5,
  },
  {
    id: 6,
    course_id: 1,
    title: 'Exception Handling Best Practices Guide',
    type: 'material',
    url: 'https://docs.python.org/3/tutorial/errors.html',
    order_no: 6,
  },
  // DBMS
  {
    id: 7,
    course_id: 2,
    title: 'Introduction to DBMS & Relational Architecture',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=kBdlM6hNDAE',
    order_no: 1,
  },
  {
    id: 8,
    course_id: 2,
    title: 'PostgreSQL Architecture and SQL Fundamentals',
    type: 'material',
    url: 'https://www.postgresql.org/docs/current/tutorial-sql.html',
    order_no: 2,
  },
  {
    id: 9,
    course_id: 2,
    title: 'ER Modeling and Schema Translation',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=QpdhBUYk7Kk',
    order_no: 3,
  },
  {
    id: 10,
    course_id: 2,
    title: 'Relational Database Schema Design Primer',
    type: 'material',
    url: 'https://www.postgresql.org/docs/current/ddl.html',
    order_no: 4,
  },
  {
    id: 11,
    course_id: 2,
    title: 'Functional Dependencies and Normalization',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=5dsrk3MQffk',
    order_no: 5,
  },
  {
    id: 12,
    course_id: 2,
    title: 'Transaction Isolation and Concurrency Control',
    type: 'material',
    url: 'https://www.postgresql.org/docs/current/transaction-iso.html',
    order_no: 6,
  },
  // DSA
  {
    id: 13,
    course_id: 3,
    title: 'Asymptotic Analysis & Big O Notation',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=AT14lCXuMKI',
    order_no: 1,
  },
  {
    id: 14,
    course_id: 3,
    title: 'Array and Pointer Memory Representation',
    type: 'material',
    url: 'https://en.wikipedia.org/wiki/Array_(data_structure)',
    order_no: 2,
  },
  {
    id: 15,
    course_id: 3,
    title: 'Singly and Doubly Linked Lists',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dmb1i4oN5oE',
    order_no: 3,
  },
  {
    id: 16,
    course_id: 3,
    title: 'Linked List Implementation Standards',
    type: 'material',
    url: 'https://en.wikipedia.org/wiki/Linked_list',
    order_no: 4,
  },
  {
    id: 17,
    course_id: 3,
    title: 'Binary Search Trees & Traversal Techniques',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=qH6yxkw0u78',
    order_no: 5,
  },
  {
    id: 18,
    course_id: 3,
    title: 'Tree Data Structures Theoretical Foundations',
    type: 'material',
    url: 'https://en.wikipedia.org/wiki/Binary_search_tree',
    order_no: 6,
  },
];

export const DEMO_ASSIGNMENTS = [
  {
    id: 1,
    course_id: 1,
    course_title: 'Python Programming',
    title: 'Lab 1: Python CLI File Parser',
    instructions: 'Build a script that reads a CSV file and calculates mean, median, and row counts. Submit Python source file (.py or .zip).',
    due_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    max_marks: 50,
  },
  {
    id: 2,
    course_id: 1,
    course_title: 'Python Programming',
    title: 'Lab 2: Object-Oriented Bank Ledger',
    instructions: 'Implement Account, SavingsAccount, and Transaction classes with custom exception handling for insufficient funds.',
    due_at: new Date(Date.now() + 120 * 3600 * 1000).toISOString(),
    max_marks: 50,
  },
  {
    id: 3,
    course_id: 2,
    course_title: 'Database Management Systems',
    title: 'Assignment 1: Schema Normalization & BCNF',
    instructions: 'Normalize the given universal university schema into 3NF and BCNF, identifying all functional dependencies.',
    due_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // Past due
    max_marks: 100,
  },
  {
    id: 4,
    course_id: 2,
    course_title: 'Database Management Systems',
    title: 'Assignment 2: Complex SQL Queries & Indexing',
    instructions: 'Write optimized PostgreSQL queries for recursive CTEs and evaluate execution plans with EXPLAIN ANALYZE.',
    due_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    max_marks: 100,
  },
  {
    id: 5,
    course_id: 3,
    course_title: 'Data Structures & Algorithms',
    title: 'Problem Set 1: Linked List Inversion & Cycle Detection',
    instructions: 'Implement Floyd Cycle Finding Algorithm and reverse a singly linked list in O(1) auxiliary space.',
    due_at: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    max_marks: 50,
  },
];

export const DEMO_LIVE_SESSIONS = [
  {
    id: 1,
    course_id: 2,
    course_title: 'Database Management Systems',
    title: 'Live Lab: BCNF Decomposition & Query Tuning',
    starts_at: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    duration_min: 60,
  },
  {
    id: 2,
    course_id: 1,
    course_title: 'Python Programming',
    title: 'Live Doubt Clearing: Advanced Decorators & Generators',
    starts_at: new Date(Date.now() + 26 * 3600 * 1000).toISOString(),
    duration_min: 45,
  },
];

export function getDemoStudentDashboard(user) {
  const isAarav = user?.email === 'student1@demo.com';
  const isPriya = user?.email === 'student2@demo.com';

  const attendancePercent = isAarav ? 92 : (isPriya ? 64 : 85);
  const attendedClasses = isAarav ? 38 : (isPriya ? 27 : 36);
  const totalClasses = 42;

  const courses = DEMO_COURSES.map((c) => {
    let progress = 50;
    let completed = 3;
    let attendance = 85;
    if (isAarav) {
      progress = c.id === 1 ? 83 : (c.id === 2 ? 100 : 83);
      completed = c.id === 2 ? 6 : 5;
      attendance = c.id === 1 ? 95 : (c.id === 2 ? 88 : 92);
    } else if (isPriya) {
      progress = c.id === 1 ? 16 : (c.id === 2 ? 0 : 33);
      completed = c.id === 1 ? 1 : (c.id === 2 ? 0 : 2);
      attendance = c.id === 1 ? 60 : (c.id === 2 ? 70 : 62);
    }
    return {
      id: c.id,
      title: c.title,
      code: c.code,
      color_index: c.color_index,
      teacherName: c.teacher.name,
      progress,
      attendance,
      totalLessons: 6,
      completedLessons: completed,
    };
  });

  const avgProgress = Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length);
  const pendingTasks = isAarav ? 1 : 3;

  const nextUp = isPriya
    ? {
        type: 'assignment',
        title: 'Assignment 1: Schema Normalization & BCNF',
        subtitle: 'Overdue task in Database Management Systems',
        actionLabel: 'Submit Overdue Work',
        href: '/student/assignments/3',
        tag: 'Urgent',
      }
    : {
        type: 'session',
        title: 'Live Lab: BCNF Decomposition & Query Tuning',
        subtitle: 'Starting today at 4:30 PM (Database Management Systems)',
        actionLabel: 'Join Live Session',
        href: '/student/live/1',
        tag: 'Live Class',
      };

  const upcoming = [
    {
      id: 'session-1',
      type: 'session',
      sessionId: 1,
      title: 'Live Lab: BCNF Decomposition & Query Tuning',
      courseCode: 'DBMS-401',
      date: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      timeInfo: '60 min',
      href: '/student/live/1',
    },
    {
      id: 'asg-1',
      type: 'assignment',
      asgId: 1,
      title: 'Lab 1: Python CLI File Parser',
      courseCode: 'CS-402',
      date: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      timeInfo: '50 marks',
      href: '/student/assignments/1',
    },
    {
      id: 'session-2',
      type: 'session',
      sessionId: 2,
      title: 'Live Doubt Clearing: Advanced Decorators & Generators',
      courseCode: 'CS-402',
      date: new Date(Date.now() + 26 * 3600 * 1000).toISOString(),
      timeInfo: '45 min',
      href: '/student/live/2',
    },
  ];

  return {
    stats: {
      coursesCount: courses.length,
      avgProgress,
      pendingTasks,
      attendancePercent,
      attendedClasses,
      totalClasses,
      attendanceEligible: attendancePercent >= 75,
    },
    nextUp,
    courses,
    upcoming,
  };
}

export function getDemoTeacherDashboard(user) {
  return {
    stats: {
      coursesCount: 3,
      studentsCount: 12,
      toGradeCount: 2,
      assignmentAverages: [
        { title: 'Python Lab 1: CLI Parser', averagePercent: 88 },
        { title: 'Python Lab 2: Bank Ledger', averagePercent: 74 },
        { title: 'DBMS Asg 1: BCNF Normalization', averagePercent: 65 },
        { title: 'DSA Problem Set 1: Linked Lists', averagePercent: 82 },
      ],
      gradeDistribution: {
        A: 4,
        B: 5,
        C: 2,
        D: 1,
        F: 0,
      },
      needsGrading: [
        {
          submissionId: 1,
          assignmentId: 1,
          assignmentTitle: 'Lab 1: Python CLI File Parser',
          courseCode: 'CS-402',
          studentName: 'Rohan Kulkarni',
          studentEmail: 'student3@demo.com',
          submittedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          isLate: false,
        },
        {
          submissionId: 2,
          assignmentId: 3,
          assignmentTitle: 'Assignment 1: Schema Normalization & BCNF',
          courseCode: 'DBMS-401',
          studentName: 'Ananya Deshmukh',
          studentEmail: 'student4@demo.com',
          submittedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
          isLate: false,
        },
      ],
    },
  };
}


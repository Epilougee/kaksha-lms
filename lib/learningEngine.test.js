import assert from 'node:assert/strict';
import {
  courseProgress,
  assignmentStatus,
  gradePercent,
  courseAverage,
  gradeBand,
  getNextUp,
  teacherStats,
} from './learningEngine.js';

console.log('--- Testing Kaksha learningEngine.js ---');

// 1. Course Progress
const lessons = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
assert.equal(courseProgress(lessons, [1, 2]), 50);
assert.equal(courseProgress(lessons, [1, 2, 3]), 75);
assert.equal(courseProgress(lessons, []), 0);
assert.equal(courseProgress([], [1]), 0);
console.log('1. courseProgress: PASS');

// 2. Assignment Status
const now = new Date('2026-11-15T12:00:00Z');
const futureAsg = { due_at: '2026-11-17T12:00:00Z' };
const pastAsg = { due_at: '2026-11-14T12:00:00Z' };

assert.equal(assignmentStatus(futureAsg, null, now).status, 'Pending');
assert.equal(assignmentStatus(pastAsg, null, now).status, 'Overdue');

const onTimeSub = { submitted_at: '2026-11-16T10:00:00Z' };
const lateSub = { submitted_at: '2026-11-18T10:00:00Z' };
assert.equal(assignmentStatus(futureAsg, onTimeSub, now).status, 'Submitted');
assert.equal(assignmentStatus(futureAsg, onTimeSub, now).isLate, false);
assert.equal(assignmentStatus(futureAsg, lateSub, now).isLate, true);

const gradedSub = { submitted_at: '2026-11-16T10:00:00Z', graded_at: '2026-11-16T15:00:00Z', marks: 85 };
assert.equal(assignmentStatus(futureAsg, gradedSub, now).status, 'Graded');
console.log('2. assignmentStatus: PASS');

// 3. Grade Percent & Bands
const asg100 = { max_marks: 100 };
assert.equal(gradePercent({ marks: 88 }, asg100), 88);
assert.equal(gradeBand(88), 'A');
assert.equal(gradeBand(75), 'B');
assert.equal(gradeBand(60), 'C');
assert.equal(gradeBand(45), 'D');
assert.equal(gradeBand(35), 'F');
assert.equal(gradeBand(null), 'N/A');
console.log('3. gradePercent & gradeBand: PASS');

// 4. Course Average
const graded = [
  { marks: 80, max_marks: 100 },
  { marks: 90, max_marks: 100 },
];
assert.equal(courseAverage(graded), 85);
console.log('4. courseAverage: PASS');

// 5. getNextUp priority test (Live class within 24h > Assignment due within 3d > Next lesson)
const courses = [
  {
    id: 1,
    title: 'Python Programming',
    code: 'CS-402',
    lessons: [{ id: 101, title: 'Intro' }, { id: 102, title: 'Variables' }],
  },
];
const sessions = [
  {
    id: 501,
    course_id: 1,
    title: 'Normalization Q&A',
    starts_at: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(), // 4h from now
    duration_min: 45,
  },
];
const asgs = [
  {
    id: 301,
    course_id: 1,
    title: 'Assignment 1',
    due_at: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(), // 2d from now
    submission: null,
  },
];

const nextUp = getNextUp(courses, { 1: [] }, asgs, sessions, now);
assert.equal(nextUp.type, 'live_session', 'Live session within 24h should take top priority');
assert.equal(nextUp.id, 501);

// When session is past 24h, assignment due in 3d should take priority
const farSessions = [{ id: 502, course_id: 1, starts_at: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString() }];
const nextAsg = getNextUp(courses, { 1: [] }, asgs, farSessions, now);
assert.equal(nextAsg.type, 'assignment');
assert.equal(nextAsg.id, 301);

// When assignment submitted, incomplete lesson should take priority
const nextLesson = getNextUp(courses, { 1: [101] }, [{ ...asgs[0], submission: {} }], farSessions, now);
assert.equal(nextLesson.type, 'lesson');
assert.equal(nextLesson.id, 102);
console.log('5. getNextUp: PASS');

// 6. Teacher stats
const stats = teacherStats(
  courses,
  [{ id: 301, course_id: 1, title: 'A1', max_marks: 100 }],
  [
    { id: 1, assignment_id: 301, student_id: 11, marks: 90, graded_at: '2026-11-15' },
    { id: 2, assignment_id: 301, student_id: 12, marks: null, graded_at: null },
  ],
  [{ course_id: 1, student_id: 11 }, { course_id: 1, student_id: 12 }]
);
assert.equal(stats.studentsCount, 2);
assert.equal(stats.toGradeCount, 1);
assert.equal(stats.gradeDistribution.A, 1);
console.log('6. teacherStats: PASS');

console.log('All learningEngine unit tests passed successfully!');

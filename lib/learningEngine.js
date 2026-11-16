/**
 * Kaksha LMS Learning Engine
 * Pure rule-based functions for calculating course progress, assignment status,
 * grade percent, course averages, grade bands, next-up recommendation, and teacher statistics.
 * No AI features.
 */

// 1. Calculate course progress as the percentage of completed lessons (0 to 100, rounded)
export function courseProgress(lessons, completedIds) {
  if (!lessons || lessons.length === 0) return 0;
  const completedSet = new Set(completedIds || []);
  const completedCount = lessons.filter((l) => completedSet.has(l.id)).length;
  return Math.round((completedCount / lessons.length) * 100);
}

// 2. Determine assignment status: Pending, Submitted, Graded, or Overdue
// Also flags whether a submission was handed in after the due date.
export function assignmentStatus(assignment, submission, now = new Date()) {
  const dueDate = new Date(assignment.due_at);
  const nowDate = new Date(now);

  if (submission) {
    const submittedDate = new Date(submission.submitted_at);
    const isLate = submittedDate.getTime() > dueDate.getTime();

    if (submission.graded_at && submission.marks !== null && submission.marks !== undefined) {
      return { status: 'Graded', isLate, isOverdue: false, isPending: false };
    }
    return { status: 'Submitted', isLate, isOverdue: false, isPending: false };
  }

  // No submission yet
  const isOverdue = nowDate.getTime() > dueDate.getTime();
  if (isOverdue) {
    return { status: 'Overdue', isLate: false, isOverdue: true, isPending: false };
  }

  return { status: 'Pending', isLate: false, isOverdue: false, isPending: true };
}

// 3. Calculate grade percentage from scored marks and max marks
export function gradePercent(submission, assignment) {
  if (!submission || submission.marks === null || submission.marks === undefined) return null;
  const max = Number(assignment?.max_marks || 100);
  if (max <= 0) return null;
  const marks = Number(submission.marks);
  return Math.round((marks / max) * 100);
}

// 4. Calculate average grade percent across graded submissions
export function courseAverage(gradedSubmissionsWithAssignment) {
  if (!gradedSubmissionsWithAssignment || gradedSubmissionsWithAssignment.length === 0) return null;

  let totalPercent = 0;
  let count = 0;

  for (const item of gradedSubmissionsWithAssignment) {
    const sub = item.submission || item;
    const asg = item.assignment || item;
    const pct = gradePercent(sub, asg);
    if (pct !== null) {
      totalPercent += pct;
      count += 1;
    }
  }

  if (count === 0) return null;
  return Math.round(totalPercent / count);
}

// 5. Categorize percentage into academic grade band:
// A (85 and above), B (70 to 84), C (55 to 69), D (40 to 54), F (below 40)
export function gradeBand(percent) {
  if (percent === null || percent === undefined) return 'N/A';
  if (percent >= 85) return 'A';
  if (percent >= 70) return 'B';
  if (percent >= 55) return 'C';
  if (percent >= 40) return 'D';
  return 'F';
}

// 6. Find the one single next task the student should focus on (powers "Continue learning")
// Priority order:
// a) Live class starting within the next 24 hours
// b) Assignment due within 3 days (not yet submitted)
// c) First incomplete lesson in any enrolled course
export function getNextUp(courses, progressMap, assignments, sessions, now = new Date()) {
  const nowDate = new Date(now);
  const nowMs = nowDate.getTime();

  // Priority A: Live class starting within 24 hours (and not ended yet)
  const sortedSessions = [...(sessions || [])].sort(
    (a, b) => new Date(a.starts_at) - new Date(b.starts_at)
  );

  for (const session of sortedSessions) {
    const startMs = new Date(session.starts_at).getTime();
    const durationMs = (session.duration_min || 45) * 60 * 1000;
    const endMs = startMs + durationMs;

    // Within next 24 hours or currently live
    if (endMs > nowMs && startMs - nowMs <= 24 * 60 * 60 * 1000) {
      const course = courses.find((c) => c.id === session.course_id);
      return {
        type: 'live_session',
        id: session.id,
        courseId: session.course_id,
        courseTitle: course?.title || '',
        courseCode: course?.code || '',
        title: session.title,
        starts_at: session.starts_at,
        duration_min: session.duration_min,
        actionLabel: 'Join Class',
        href: `/student/live/${session.id}`,
        reason: 'Live class starting soon',
      };
    }
  }

  // Priority B: Assignment due within 3 days that has not been submitted
  const sortedAssignments = [...(assignments || [])].sort(
    (a, b) => new Date(a.due_at) - new Date(b.due_at)
  );

  for (const asg of sortedAssignments) {
    const dueMs = new Date(asg.due_at).getTime();
    const diffMs = dueMs - nowMs;
    // Due within 3 days and not yet overdue
    if (diffMs > 0 && diffMs <= 3 * 24 * 60 * 60 * 1000) {
      const sub = asg.submission;
      if (!sub) {
        const course = courses.find((c) => c.id === asg.course_id);
        return {
          type: 'assignment',
          id: asg.id,
          courseId: asg.course_id,
          courseTitle: course?.title || '',
          courseCode: course?.code || '',
          title: asg.title,
          due_at: asg.due_at,
          max_marks: asg.max_marks,
          actionLabel: 'Submit Assignment',
          href: `/student/assignments/${asg.id}`,
          reason: 'Due within 3 days',
        };
      }
    }
  }

  // Priority C: Next incomplete lesson
  for (const course of courses || []) {
    const lessons = course.lessons || [];
    const completedSet = new Set(progressMap?.[course.id] || []);

    const nextLesson = lessons.find((l) => !completedSet.has(l.id));
    if (nextLesson) {
      return {
        type: 'lesson',
        id: nextLesson.id,
        courseId: course.id,
        courseTitle: course.title,
        courseCode: course.code,
        title: nextLesson.title,
        lessonType: nextLesson.type,
        actionLabel: 'Continue Lesson',
        href: `/student/courses/${course.id}?lesson=${nextLesson.id}`,
        reason: 'Next incomplete lesson',
      };
    }
  }

  return null;
}

// 7. Calculate aggregate teacher statistics across owned courses and their submissions
export function teacherStats(courses, assignments, submissions, enrollments) {
  const courseIds = new Set((courses || []).map((c) => c.id));
  const relevantAssignments = (assignments || []).filter((a) => courseIds.has(a.course_id));
  const asgIdMap = new Map(relevantAssignments.map((a) => [a.id, a]));

  const relevantSubmissions = (submissions || []).filter((s) => asgIdMap.has(s.assignment_id));

  // Count unique students enrolled
  const uniqueStudents = new Set(
    (enrollments || []).filter((e) => courseIds.has(e.course_id)).map((e) => e.student_id)
  );

  // Submissions waiting to be graded (no marks or no graded_at)
  const toGrade = relevantSubmissions.filter(
    (s) => s.graded_at === null || s.marks === null || s.marks === undefined
  );

  // Average score per assignment
  const scoresByAsg = new Map();
  for (const sub of relevantSubmissions) {
    if (sub.graded_at && sub.marks !== null && sub.marks !== undefined) {
      if (!scoresByAsg.has(sub.assignment_id)) {
        scoresByAsg.set(sub.assignment_id, []);
      }
      const asg = asgIdMap.get(sub.assignment_id);
      const pct = gradePercent(sub, asg);
      if (pct !== null) {
        scoresByAsg.get(sub.assignment_id).push(pct);
      }
    }
  }

  const assignmentAverages = relevantAssignments.map((a) => {
    const pcts = scoresByAsg.get(a.id) || [];
    const avg = pcts.length > 0 ? Math.round(pcts.reduce((sum, v) => sum + v, 0) / pcts.length) : 0;
    return {
      assignmentId: a.id,
      title: a.title,
      courseId: a.course_id,
      averagePercent: avg,
      gradedCount: pcts.length,
    };
  });

  // Grade band distribution across all graded submissions
  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const sub of relevantSubmissions) {
    if (sub.graded_at && sub.marks !== null) {
      const asg = asgIdMap.get(sub.assignment_id);
      const pct = gradePercent(sub, asg);
      const band = gradeBand(pct);
      if (gradeDistribution[band] !== undefined) {
        gradeDistribution[band] += 1;
      }
    }
  }

  return {
    coursesCount: courses?.length || 0,
    studentsCount: uniqueStudents.size,
    toGradeCount: toGrade.length,
    needsGrading: toGrade.map((s) => ({
      submissionId: s.id,
      assignmentId: s.assignment_id,
      studentId: s.student_id,
      assignmentTitle: asgIdMap.get(s.assignment_id)?.title || '',
      submitted_at: s.submitted_at,
    })),
    assignmentAverages,
    gradeDistribution,
  };
}

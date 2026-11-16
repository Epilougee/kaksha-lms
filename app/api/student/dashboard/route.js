import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { courseProgress, getNextUp } from '@/lib/learningEngine';

// Return student dashboard stats, "Continue learning" card, course progress list, and upcoming items
export async function GET() {
  const { user, errorResponse } = await requireRole('student');
  if (errorResponse) return errorResponse;

  try {
    const supabase = getSupabase();

    // 1. Fetch courses the student is enrolled in
    const { data: enrollments, error: eErr } = await supabase
      .from('enrollments')
      .select('course_id, joined_at, courses(*, users!courses_teacher_id_fkey(name))')
      .eq('student_id', user.id);

    if (eErr) throw eErr;

    const courses = (enrollments || []).map((e) => e.courses).filter(Boolean);
    const courseIds = courses.map((c) => c.id);

    if (courseIds.length === 0) {
      return NextResponse.json({
        stats: { coursesCount: 0, avgProgress: 0, pendingTasks: 0 },
        nextUp: null,
        courses: [],
        upcoming: [],
      });
    }

    // 2. Fetch lessons, lesson progress, assignments, submissions, and live sessions
    const [
      { data: lessons, error: lErr },
      { data: progressRows, error: pErr },
      { data: assignments, error: aErr },
      { data: submissions, error: subErr },
      { data: sessions, error: sErr },
    ] = await Promise.all([
      supabase.from('lessons').select('*').in('course_id', courseIds).order('order_no'),
      supabase.from('lesson_progress').select('*').eq('student_id', user.id),
      supabase.from('assignments').select('*').in('course_id', courseIds).order('due_at'),
      supabase.from('submissions').select('*').eq('student_id', user.id),
      supabase.from('live_sessions').select('*').in('course_id', courseIds).order('starts_at'),
    ]);

    if (lErr) throw lErr;
    if (pErr) throw pErr;
    if (aErr) throw aErr;
    if (subErr) throw subErr;
    if (sErr) throw sErr;

    // Build completed lesson map per course
    const completedLessonIds = new Set((progressRows || []).map((p) => p.lesson_id));
    const progressMap = {};
    for (const c of courses) {
      progressMap[c.id] = (progressRows || [])
        .filter((p) => (lessons || []).some((l) => l.id === p.lesson_id && l.course_id === c.id))
        .map((p) => p.lesson_id);
    }

    // Attach lessons to each course
    const coursesWithLessons = courses.map((c) => {
      const cLessons = (lessons || []).filter((l) => l.course_id === c.id);
      const progress = courseProgress(cLessons, progressMap[c.id]);
      return {
        ...c,
        teacherName: c.users?.name || 'Faculty',
        lessons: cLessons,
        progress,
        totalLessons: cLessons.length,
        completedLessons: (progressMap[c.id] || []).length,
      };
    });

    // Map submissions to assignments
    const subByAsgId = new Map((submissions || []).map((s) => [s.assignment_id, s]));
    const asgsWithSubmissions = (assignments || []).map((a) => ({
      ...a,
      submission: subByAsgId.get(a.id) || null,
    }));

    // Calculate "Next Up" task
    const now = new Date();
    const nextUp = getNextUp(coursesWithLessons, progressMap, asgsWithSubmissions, sessions || [], now);

    // Calculate pending tasks (unsubmitted assignments with due date in future or past)
    const pendingTasks = asgsWithSubmissions.filter((a) => !a.submission).length;

    // Calculate average progress across enrolled courses
    const avgProgress =
      coursesWithLessons.length > 0
        ? Math.round(
            coursesWithLessons.reduce((sum, c) => sum + c.progress, 0) / coursesWithLessons.length
          )
        : 0;

    // Upcoming list (upcoming live sessions & unsubmitted assignments due soon)
    const upcoming = [];
    (sessions || []).forEach((s) => {
      const course = courses.find((c) => c.id === s.course_id);
      upcoming.push({
        id: `session-${s.id}`,
        type: 'session',
        sessionId: s.id,
        title: s.title,
        courseCode: course?.code || '',
        date: s.starts_at,
        timeInfo: `${s.duration_min} min`,
        href: `/student/live/${s.id}`,
      });
    });

    asgsWithSubmissions
      .filter((a) => !a.submission)
      .forEach((a) => {
        const course = courses.find((c) => c.id === a.course_id);
        upcoming.push({
          id: `asg-${a.id}`,
          type: 'assignment',
          asgId: a.id,
          title: a.title,
          courseCode: course?.code || '',
          date: a.due_at,
          timeInfo: `${a.max_marks} marks`,
          href: `/student/assignments/${a.id}`,
        });
      });

    // Sort upcoming items by date ascending
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

    return NextResponse.json({
      stats: {
        coursesCount: courses.length,
        avgProgress,
        pendingTasks,
      },
      nextUp,
      courses: coursesWithLessons.map((c) => ({
        id: c.id,
        title: c.title,
        code: c.code,
        color_index: c.color_index,
        teacherName: c.teacherName,
        progress: c.progress,
        totalLessons: c.totalLessons,
        completedLessons: c.completedLessons,
      })),
      upcoming: upcoming.slice(0, 6),
    });
  } catch (err) {
    console.warn('Student dashboard using demo fallback:', err.message);
    const { getDemoStudentDashboard } = await import('@/lib/demoData');
    return NextResponse.json(getDemoStudentDashboard(user));
  }
}

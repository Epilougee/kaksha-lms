import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { teacherStats } from '@/lib/learningEngine';

// Get teacher dashboard overview stats, assignment average scores, and submissions waiting to be graded
export async function GET() {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const supabase = getSupabase();

    // 1. Fetch courses owned by this teacher
    const { data: courses, error: cErr } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', user.id)
      .order('id');

    if (cErr) throw cErr;

    const courseIds = (courses || []).map((c) => c.id);
    if (courseIds.length === 0) {
      return NextResponse.json({
        stats: {
          coursesCount: 0,
          studentsCount: 0,
          toGradeCount: 0,
          needsGrading: [],
          assignmentAverages: [],
          gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        },
        courses: [],
      });
    }

    // 2. Fetch assignments, submissions, and enrollments for owned courses
    const [
      { data: assignments, error: aErr },
      { data: enrollments, error: eErr },
      { data: submissions, error: subErr },
      { data: students, error: stuErr },
    ] = await Promise.all([
      supabase.from('assignments').select('*').in('course_id', courseIds).order('due_at'),
      supabase.from('enrollments').select('*').in('course_id', courseIds),
      supabase.from('submissions').select('*'),
      supabase.from('users').select('id, name, email').eq('role', 'student'),
    ]);

    if (aErr) throw aErr;
    if (eErr) throw eErr;
    if (subErr) throw subErr;
    if (stuErr) throw stuErr;

    const studentMap = new Map((students || []).map((s) => [s.id, s]));
    const asgMap = new Map((assignments || []).map((a) => [a.id, a]));
    const courseMap = new Map((courses || []).map((c) => [c.id, c]));

    const computed = teacherStats(courses, assignments, submissions, enrollments);

    // Enrich needsGrading list with student name and course code
    const needsGradingEnriched = (computed.needsGrading || []).map((item) => {
      const student = studentMap.get(item.studentId);
      const asg = asgMap.get(item.assignmentId);
      const course = asg ? courseMap.get(asg.course_id) : null;
      return {
        ...item,
        studentName: student?.name || 'Student',
        studentEmail: student?.email || '',
        courseCode: course?.code || '',
        courseTitle: course?.title || '',
      };
    });

    return NextResponse.json({
      stats: {
        ...computed,
        needsGrading: needsGradingEnriched,
      },
      courses: (courses || []).map((c) => ({
        id: c.id,
        title: c.title,
        code: c.code,
        color_index: c.color_index,
        join_code: c.join_code,
        enrolledCount: (enrollments || []).filter((e) => e.course_id === c.id).length,
      })),
    });
  } catch (err) {
    console.warn('Teacher dashboard using demo fallback:', err.message);
    const { getDemoTeacherDashboard, DEMO_COURSES } = await import('@/lib/demoData');
    const demo = getDemoTeacherDashboard(user);
    return NextResponse.json({
      ...demo,
      courses: DEMO_COURSES.map((c) => ({
        id: c.id,
        title: c.title,
        code: c.code,
        color_index: c.color_index,
        join_code: c.join_code,
        enrolledCount: 12,
      })),
    });
  }
}

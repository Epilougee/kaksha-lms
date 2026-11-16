import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { courseProgress } from '@/lib/learningEngine';

// Get enrolled courses for student, with search and progress
export async function GET() {
  const { user, errorResponse } = await requireRole('student');
  if (errorResponse) return errorResponse;

  try {
    const supabase = getSupabase();

    const { data: enrollments, error: eErr } = await supabase
      .from('enrollments')
      .select('course_id, joined_at, courses(*, users!courses_teacher_id_fkey(name))')
      .eq('student_id', user.id);

    if (eErr) throw eErr;

    const courses = (enrollments || []).map((e) => e.courses).filter(Boolean);
    const courseIds = courses.map((c) => c.id);

    if (courseIds.length === 0) {
      return NextResponse.json({ courses: [] });
    }

    const [
      { data: lessons, error: lErr },
      { data: progressRows, error: pErr },
    ] = await Promise.all([
      supabase.from('lessons').select('id, course_id').in('course_id', courseIds),
      supabase.from('lesson_progress').select('lesson_id').eq('student_id', user.id),
    ]);

    if (lErr) throw lErr;
    if (pErr) throw pErr;

    const completedSet = new Set((progressRows || []).map((p) => p.lesson_id));

    const enriched = courses.map((c) => {
      const cLessons = (lessons || []).filter((l) => l.course_id === c.id);
      const progress = courseProgress(cLessons, Array.from(completedSet));
      return {
        id: c.id,
        title: c.title,
        code: c.code,
        description: c.description,
        color_index: c.color_index,
        teacherName: c.users?.name || 'Faculty',
        progress,
        totalLessons: cLessons.length,
      };
    });

    return NextResponse.json({ courses: enriched });
  } catch (err) {
    console.warn('My courses using demo fallback:', err.message);
    const { DEMO_COURSES } = await import('@/lib/demoData');
    return NextResponse.json({
      courses: DEMO_COURSES.map((c) => ({
        id: c.id,
        title: c.title,
        code: c.code,
        description: c.description,
        color_index: c.color_index,
        teacherName: c.teacher.name,
        progress: user?.email === 'student1@demo.com' ? 89 : 25,
        totalLessons: 6,
      })),
    });
  }
}

// Join a course with join code (e.g., PY402, DB401)
export async function POST(request) {
  const { user, errorResponse } = await requireRole('student');
  if (errorResponse) return errorResponse;

  try {
    const { code } = await request.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Join code is required.' }, { status: 400 });
    }

    const supabase = getSupabase();
    const cleanCode = code.trim().toUpperCase();

    // Find course by join code
    const { data: course, error: cErr } = await supabase
      .from('courses')
      .select('id, title, code')
      .eq('join_code', cleanCode)
      .single();

    if (cErr || !course) {
      return NextResponse.json(
        { error: 'Invalid course join code. Please check with your instructor.' },
        { status: 404 }
      );
    }

    // Insert enrollment
    const { data, error: inErr } = await supabase
      .from('enrollments')
      .insert({ course_id: course.id, student_id: user.id })
      .select()
      .single();

    if (inErr) {
      if (inErr.code === '23505') {
        return NextResponse.json({ error: 'You are already enrolled in this course.' }, { status: 400 });
      }
      throw inErr;
    }

    return NextResponse.json({ ok: true, courseId: course.id, courseTitle: course.title });
  } catch (err) {
    console.error('Join course error:', err);
    return NextResponse.json({ error: 'Failed to join course.' }, { status: 500 });
  }
}

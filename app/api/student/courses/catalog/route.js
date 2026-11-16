import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { getCatalogCourses } from '@/lib/demoData';

export async function GET() {
  const { user, errorResponse } = await requireRole('student');
  if (errorResponse) return errorResponse;

  try {
    const supabase = getSupabase();

    // Query courses, their lessons count, and check user's enrollment
    const [{ data: courses, error: cErr }, { data: enrollments, error: eErr }] = await Promise.all([
      supabase
        .from('courses')
        .select('*, users!courses_teacher_id_fkey(name), lessons(id)'),
      supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id),
    ]);

    if (cErr) throw cErr;
    if (eErr) throw eErr;

    const enrolledIds = new Set((enrollments || []).map((e) => e.course_id));

    const catalog = (courses || []).map((c) => ({
      id: c.id,
      title: c.title,
      code: c.code,
      description: c.description,
      color_index: c.color_index,
      price: c.price || 0,
      originalPrice: (c.price || 0) > 0 ? (c.price * 2.5) : 999,
      teacherName: c.users?.name || 'Faculty',
      lessonsCount: c.lessons?.length || 0,
      isEnrolled: enrolledIds.has(c.id),
    }));

    return NextResponse.json({ courses: catalog });
  } catch (err) {
    console.warn('Course catalog fallback to demoData:', err.message);
    return NextResponse.json({ courses: getCatalogCourses(user) });
  }
}

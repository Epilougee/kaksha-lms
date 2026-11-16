import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

// Get full course editor details: course metadata, lessons, live sessions, assignments
export async function GET(request, { params }) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const courseId = Number(params.id);
    const supabase = getSupabase();

    // Verify ownership
    const { data: course, error: cErr } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('teacher_id', user.id)
      .single();

    if (cErr) throw cErr;
    if (!course) {
      return NextResponse.json({ error: 'Course not found or access denied.' }, { status: 404 });
    }

    const [
      { data: lessons, error: lErr },
      { data: sessions, error: sErr },
      { data: assignments, error: aErr },
      { data: enrollments, error: eErr },
    ] = await Promise.all([
      supabase.from('lessons').select('*').eq('course_id', courseId).order('order_no'),
      supabase.from('live_sessions').select('*').eq('course_id', courseId).order('starts_at'),
      supabase.from('assignments').select('*').eq('course_id', courseId).order('due_at'),
      supabase.from('enrollments').select('id').eq('course_id', courseId),
    ]);

    if (lErr) throw lErr;
    if (sErr) throw sErr;
    if (aErr) throw aErr;
    if (eErr) throw eErr;

    return NextResponse.json({
      course: {
        ...course,
        enrolledCount: (enrollments || []).length,
      },
      lessons: lessons || [],
      sessions: sessions || [],
      assignments: assignments || [],
    });
  } catch (err) {
    console.warn('Teacher course editor using demo fallback:', err.message);
    const { DEMO_COURSES, DEMO_LESSONS, DEMO_LIVE_SESSIONS, DEMO_ASSIGNMENTS } = await import('@/lib/demoData');
    const courseId = Number(params.id) || 1;
    const course = DEMO_COURSES.find((c) => c.id === courseId) || DEMO_COURSES[0];
    return NextResponse.json({
      course: {
        ...course,
        enrolledCount: 12,
      },
      lessons: DEMO_LESSONS.filter((l) => l.course_id === course.id),
      sessions: DEMO_LIVE_SESSIONS.filter((s) => s.course_id === course.id),
      assignments: DEMO_ASSIGNMENTS.filter((a) => a.course_id === course.id),
    });
  }
}

// Update course details
export async function PUT(request, { params }) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const courseId = Number(params.id);
    const { title, description, color_index, price } = await request.json();
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('courses')
      .update({
        title: title?.trim(),
        description: description?.trim() || '',
        color_index: Number(color_index) || 0,
        price: Math.max(0, Number(price) || 0),
      })
      .eq('id', courseId)
      .eq('teacher_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ course: data });
  } catch (err) {
    console.error('Update course error:', err);
    return NextResponse.json({ error: 'Failed to update course.' }, { status: 500 });
  }
}

// Delete course (cascades to lessons, assignments, enrollments)
export async function DELETE(request, { params }) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const courseId = Number(params.id);
    const supabase = getSupabase();

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)
      .eq('teacher_id', user.id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Delete course error:', err);
    return NextResponse.json({ error: 'Failed to delete course.' }, { status: 500 });
  }
}

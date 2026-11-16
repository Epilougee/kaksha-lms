import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

// Mark a lesson as completed (or toggle complete)
export async function POST(request, { params }) {
  const { user, errorResponse } = await requireRole('student');
  if (errorResponse) return errorResponse;

  try {
    const lessonId = Number(params.id);
    const { completed } = await request.json();
    const supabase = getSupabase();

    // Verify the student is enrolled in the course that contains this lesson
    const { data: lesson, error: lErr } = await supabase
      .from('lessons')
      .select('id, course_id')
      .eq('id', lessonId)
      .single();

    if (lErr || !lesson) {
      return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 });
    }

    const { data: enrollment, error: eErr } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', lesson.course_id)
      .eq('student_id', user.id)
      .single();

    if (eErr || !enrollment) {
      return NextResponse.json({ error: 'You are not enrolled in this course.' }, { status: 403 });
    }

    if (completed === false) {
      // Remove progress record
      await supabase
        .from('lesson_progress')
        .delete()
        .eq('lesson_id', lessonId)
        .eq('student_id', user.id);
      return NextResponse.json({ ok: true, completed: false });
    }

    // Insert progress record
    const { data, error } = await supabase
      .from('lesson_progress')
      .upsert({ lesson_id: lessonId, student_id: user.id }, { onConflict: 'lesson_id,student_id' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, completed: true, progress: data });
  } catch (err) {
    console.error('Lesson progress error:', err);
    return NextResponse.json({ error: 'Failed to update lesson progress.' }, { status: 500 });
  }
}

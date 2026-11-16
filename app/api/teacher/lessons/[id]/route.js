import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

// Update lesson details (title, url, file_path, order_no)
export async function PUT(request, { params }) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const lessonId = Number(params.id);
    const { title, url, file_path, order_no } = await request.json();
    const supabase = getSupabase();

    // Verify teacher owns the course that owns this lesson
    const { data: lesson, error: lErr } = await supabase
      .from('lessons')
      .select('id, course_id, courses!inner(teacher_id)')
      .eq('id', lessonId)
      .single();

    if (lErr || !lesson || lesson.courses?.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Lesson not found or access denied.' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('lessons')
      .update({
        title: title?.trim(),
        url: url?.trim() || null,
        file_path: file_path || null,
        order_no: Number(order_no) || 1,
      })
      .eq('id', lessonId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ lesson: data });
  } catch (err) {
    console.error('Update lesson error:', err);
    return NextResponse.json({ error: 'Failed to update lesson.' }, { status: 500 });
  }
}

// Delete lesson
export async function DELETE(request, { params }) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const lessonId = Number(params.id);
    const supabase = getSupabase();

    const { data: lesson, error: lErr } = await supabase
      .from('lessons')
      .select('id, courses!inner(teacher_id)')
      .eq('id', lessonId)
      .single();

    if (lErr || !lesson || lesson.courses?.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Lesson not found or access denied.' }, { status: 403 });
    }

    const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Delete lesson error:', err);
    return NextResponse.json({ error: 'Failed to delete lesson.' }, { status: 500 });
  }
}

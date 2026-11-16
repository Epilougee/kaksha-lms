import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

// Add new lesson to course (video or material)
export async function POST(request, { params }) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const courseId = Number(params.id);
    const { title, type, url, file_path, order_no } = await request.json();

    if (!title || !type) {
      return NextResponse.json({ error: 'Lesson title and type are required.' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Verify teacher owns the course
    const { data: course, error: cErr } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('teacher_id', user.id)
      .single();

    if (cErr || !course) {
      return NextResponse.json({ error: 'Course not found or access denied.' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        title: title.trim(),
        type: type === 'material' ? 'material' : 'video',
        url: url?.trim() || null,
        file_path: file_path || null,
        order_no: Number(order_no) || 1,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ lesson: data }, { status: 201 });
  } catch (err) {
    console.error('Add lesson error:', err);
    return NextResponse.json({ error: 'Failed to add lesson.' }, { status: 500 });
  }
}

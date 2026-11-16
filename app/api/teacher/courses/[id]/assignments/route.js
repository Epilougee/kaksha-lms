import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

// Create a new assignment for course
export async function POST(request, { params }) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const courseId = Number(params.id);
    const { title, instructions, due_at, max_marks } = await request.json();

    if (!title || !due_at) {
      return NextResponse.json({ error: 'Title and due date are required.' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Verify course ownership
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
      .from('assignments')
      .insert({
        course_id: courseId,
        title: title.trim(),
        instructions: instructions?.trim() || '',
        due_at: new Date(due_at).toISOString(),
        max_marks: Number(max_marks) || 100,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ assignment: data }, { status: 201 });
  } catch (err) {
    console.error('Create assignment error:', err);
    return NextResponse.json({ error: 'Failed to create assignment.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

// Schedule a new live session for a course
export async function POST(request, { params }) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const courseId = Number(params.id);
    const { title, starts_at, duration_min } = await request.json();

    if (!title || !starts_at) {
      return NextResponse.json({ error: 'Title and start time are required.' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Verify ownership
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
      .from('live_sessions')
      .insert({
        course_id: courseId,
        title: title.trim(),
        starts_at: new Date(starts_at).toISOString(),
        duration_min: Number(duration_min) || 45,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ session: data }, { status: 201 });
  } catch (err) {
    console.error('Schedule live session error:', err);
    return NextResponse.json({ error: 'Failed to schedule live session.' }, { status: 500 });
  }
}

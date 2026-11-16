import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

// Get list of courses owned by teacher
export async function GET() {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const supabase = getSupabase();
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', user.id)
      .order('id');

    if (error) throw error;
    return NextResponse.json({ courses: courses || [] });
  } catch (err) {
    console.warn('Teacher courses using demo fallback:', err.message);
    const { DEMO_COURSES } = await import('@/lib/demoData');
    return NextResponse.json({ courses: DEMO_COURSES });
  }
}

// Create a new course with join code and color_index
export async function POST(request) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const { title, code, description, color_index, join_code } = await request.json();

    if (!title || !code) {
      return NextResponse.json({ error: 'Course title and course code are required.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const generatedJoinCode = join_code
      ? join_code.trim().toUpperCase()
      : `${cleanCode.replace(/[^A-Z0-9]/g, '').slice(0, 4)}${Math.floor(100 + Math.random() * 900)}`;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: title.trim(),
        code: cleanCode,
        description: description?.trim() || '',
        color_index: Number(color_index) || 0,
        teacher_id: user.id,
        join_code: generatedJoinCode,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A course with this code or join code already exists.' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ course: data }, { status: 201 });
  } catch (err) {
    console.error('Create course error:', err);
    return NextResponse.json({ error: 'Failed to create course.' }, { status: 500 });
  }
}

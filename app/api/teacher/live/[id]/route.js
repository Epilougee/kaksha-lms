import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

// Get live session room details for teacher (as broadcaster / host)
export async function GET(request, { params }) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const sessionId = Number(params.id);
    const supabase = getSupabase();

    const { data: session, error: sErr } = await supabase
      .from('live_sessions')
      .select('*, courses(*)')
      .eq('id', sessionId)
      .single();

    if (sErr || !session) {
      throw new Error('Session not found in DB');
    }

    const roomName = `kaksha-${session.course_id}-${session.id}-${session.courses?.code || 'live'}`.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    return NextResponse.json({
      session: {
        id: session.id,
        title: session.title,
        starts_at: session.starts_at,
        duration_min: session.duration_min,
        courseTitle: session.courses?.title || '',
        courseCode: session.courses?.code || '',
        roomName,
        teacherName: user.name,
        isHost: true,
      },
    });
  } catch (err) {
    console.warn('Teacher live room using demo fallback:', err.message);
    const { DEMO_COURSES, DEMO_LIVE_SESSIONS } = await import('@/lib/demoData');

    const sessionId = Number(params.id) || 1;
    const session = DEMO_LIVE_SESSIONS.find((s) => s.id === sessionId) || DEMO_LIVE_SESSIONS[0];
    const course = DEMO_COURSES.find((c) => c.id === session.course_id) || DEMO_COURSES[0];
    const roomName = `kaksha-${session.course_id}-${session.id}-${course?.code || 'live'}`.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    return NextResponse.json({
      session: {
        id: session.id,
        title: session.title,
        starts_at: session.starts_at,
        duration_min: session.duration_min,
        courseTitle: course.title,
        courseCode: course.code,
        roomName,
        teacherName: user.name,
        isHost: true,
      },
    });
  }
}

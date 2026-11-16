import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

// Get live session room info, verify enrollment, and return Jitsi room name
export async function GET(request, { params }) {
  const { user, errorResponse } = await requireRole('student');
  if (errorResponse) return errorResponse;

  try {
    const sessionId = Number(params.id);
    const supabase = getSupabase();

    const { data: session, error: sErr } = await supabase
      .from('live_sessions')
      .select('*, courses(id, title, code, users!courses_teacher_id_fkey(name))')
      .eq('id', sessionId)
      .single();

    if (sErr || !session) {
      return NextResponse.json({ error: 'Live session not found.' }, { status: 404 });
    }

    // Verify enrollment
    const { data: enrollment, error: eErr } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', session.course_id)
      .eq('student_id', user.id)
      .single();

    if (eErr || !enrollment) {
      return NextResponse.json({ error: 'You are not enrolled in this course.' }, { status: 403 });
    }

    const startMs = new Date(session.starts_at).getTime();
    const durationMs = (session.duration_min || 45) * 60 * 1000;
    const nowMs = Date.now();

    const canJoin = nowMs >= startMs - 10 * 60 * 1000 && nowMs <= startMs + durationMs;

    // Room name derived from session id and course code for Jitsi Meet (meet.jit.si)
    const roomName = `kaksha-${session.course_id}-${session.id}-${session.courses?.code || 'live'}`.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    return NextResponse.json({
      session: {
        id: session.id,
        title: session.title,
        starts_at: session.starts_at,
        duration_min: session.duration_min,
        courseTitle: session.courses?.title || '',
        courseCode: session.courses?.code || '',
        teacherName: session.courses?.users?.name || 'Faculty',
        roomName,
        canJoin,
        userName: user.name,
      },
    });
  } catch (err) {
    console.error('Live room error:', err);
    return NextResponse.json({ error: 'Failed to load live room.' }, { status: 500 });
  }
}

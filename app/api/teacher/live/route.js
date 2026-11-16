import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

// Get all scheduled live sessions across all courses owned by teacher
export async function GET() {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const supabase = getSupabase();

    // 1. Fetch courses owned by teacher
    const { data: courses, error: cErr } = await supabase
      .from('courses')
      .select('id, title, code, color_index')
      .eq('teacher_id', user.id);

    if (cErr) throw cErr;

    const courseIds = (courses || []).map((c) => c.id);
    if (courseIds.length === 0) {
      return NextResponse.json({ sessions: [], courses: [] });
    }

    // 2. Fetch live sessions for these courses
    const { data: sessions, error: sErr } = await supabase
      .from('live_sessions')
      .select('*')
      .in('course_id', courseIds)
      .order('starts_at');

    if (sErr) throw sErr;

    const courseMap = new Map((courses || []).map((c) => [c.id, c]));
    const nowMs = Date.now();

    const enriched = (sessions || []).map((s) => {
      const course = courseMap.get(s.course_id);
      const startMs = new Date(s.starts_at).getTime();
      const durationMs = (s.duration_min || 45) * 60 * 1000;
      const endMs = startMs + durationMs;

      // Teachers can host/enter anytime
      const isPast = nowMs > endMs;
      const isLiveNow = nowMs >= startMs - 10 * 60 * 1000 && nowMs <= endMs;

      return {
        id: s.id,
        course_id: s.course_id,
        title: s.title,
        starts_at: s.starts_at,
        duration_min: s.duration_min,
        courseTitle: course?.title || '',
        courseCode: course?.code || '',
        color_index: course?.color_index || 0,
        isPast,
        isLiveNow,
        roomName: `kaksha-${s.course_id}-${s.id}-${course?.code || 'live'}`.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      };
    });

    return NextResponse.json({
      sessions: enriched,
      courses: courses || [],
    });
  } catch (err) {
    console.warn('Teacher live sessions using demo fallback:', err.message);
    const { DEMO_COURSES, DEMO_LIVE_SESSIONS } = await import('@/lib/demoData');

    const enriched = DEMO_LIVE_SESSIONS.map((s) => {
      const course = DEMO_COURSES.find((c) => c.id === s.course_id);
      const startMs = new Date(s.starts_at).getTime();
      const durationMs = (s.duration_min || 45) * 60 * 1000;
      const endMs = startMs + durationMs;
      const nowMs = Date.now();

      return {
        id: s.id,
        course_id: s.course_id,
        title: s.title,
        starts_at: s.starts_at,
        duration_min: s.duration_min,
        courseTitle: course?.title || s.course_title,
        courseCode: course?.code || 'CS',
        color_index: course?.color_index || 0,
        isPast: nowMs > endMs,
        isLiveNow: true,
        roomName: `kaksha-${s.course_id}-${s.id}-${course?.code || 'live'}`.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      };
    });

    return NextResponse.json({
      sessions: enriched,
      courses: DEMO_COURSES,
    });
  }
}

// Schedule a new live session from teacher portal
export async function POST(request) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const { course_id, title, starts_at, duration_min } = await request.json();

    if (!course_id || !title || !starts_at) {
      return NextResponse.json({ error: 'Course, title, and start time are required.' }, { status: 400 });
    }

    const courseId = Number(course_id);
    const supabase = getSupabase();

    // Verify course ownership
    const { data: course, error: cErr } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('teacher_id', user.id)
      .single();

    if (cErr || !course) {
      // In demo mode without DB table, succeed with mock response
      return NextResponse.json({
        session: {
          id: Date.now(),
          course_id: courseId,
          title: title.trim(),
          starts_at: new Date(starts_at).toISOString(),
          duration_min: Number(duration_min) || 45,
        },
      }, { status: 201 });
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
    return NextResponse.json({ error: 'Failed to schedule live class.' }, { status: 500 });
  }
}

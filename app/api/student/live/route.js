import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

// Get all scheduled live sessions for courses the student is enrolled in
export async function GET() {
  const { user, errorResponse } = await requireRole('student');
  if (errorResponse) return errorResponse;

  try {
    const supabase = getSupabase();

    const { data: enrollments, error: eErr } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', user.id);

    if (eErr) throw eErr;

    const courseIds = (enrollments || []).map((e) => e.course_id);
    if (courseIds.length === 0) {
      return NextResponse.json({ sessions: [] });
    }

    const { data: sessions, error: sErr } = await supabase
      .from('live_sessions')
      .select('*, courses(id, title, code, color_index, users!courses_teacher_id_fkey(name))')
      .in('course_id', courseIds)
      .order('starts_at');

    if (sErr) throw sErr;

    const nowMs = Date.now();
    const enriched = (sessions || []).map((s) => {
      const startMs = new Date(s.starts_at).getTime();
      const durationMs = (s.duration_min || 45) * 60 * 1000;
      const endMs = startMs + durationMs;

      // Join button activates 10 minutes before start time and stays active until session ends
      const canJoin = nowMs >= startMs - 10 * 60 * 1000 && nowMs <= endMs;
      const isPast = nowMs > endMs;

      return {
        ...s,
        courseTitle: s.courses?.title || '',
        courseCode: s.courses?.code || '',
        color_index: s.courses?.color_index || 0,
        teacherName: s.courses?.users?.name || 'Faculty',
        canJoin,
        isPast,
      };
    });

    return NextResponse.json({ sessions: enriched });
  } catch (err) {
    console.warn('Live sessions using demo fallback:', err.message);
    const { DEMO_LIVE_SESSIONS } = await import('@/lib/demoData');
    return NextResponse.json({
      sessions: DEMO_LIVE_SESSIONS.map((s) => ({
        id: s.id,
        course_id: s.course_id,
        title: s.title,
        starts_at: s.starts_at,
        duration_min: s.duration_min,
        courseTitle: s.course_title,
        courseCode: s.course_id === 1 ? 'CS-402' : 'DBMS-401',
        color_index: s.course_id === 1 ? 0 : 1,
        teacherName: 'Dr. Ramesh Iyer',
        canJoin: true,
        isPast: false,
      })),
    });
  }
}

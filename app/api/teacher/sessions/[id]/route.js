import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

// Delete a scheduled live session
export async function DELETE(request, { params }) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const sessionId = Number(params.id);
    const supabase = getSupabase();

    const { data: session, error: sErr } = await supabase
      .from('live_sessions')
      .select('id, courses!inner(teacher_id)')
      .eq('id', sessionId)
      .single();

    if (sErr || !session || session.courses?.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Session not found or access denied.' }, { status: 403 });
    }

    const { error } = await supabase.from('live_sessions').delete().eq('id', sessionId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Delete session error:', err);
    return NextResponse.json({ error: 'Failed to delete live session.' }, { status: 500 });
  }
}

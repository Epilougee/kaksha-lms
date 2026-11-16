import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

// Delete an assignment
export async function DELETE(request, { params }) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const asgId = Number(params.id);
    const supabase = getSupabase();

    const { data: asg, error: aErr } = await supabase
      .from('assignments')
      .select('id, courses!inner(teacher_id)')
      .eq('id', asgId)
      .single();

    if (aErr || !asg || asg.courses?.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Assignment not found or access denied.' }, { status: 403 });
    }

    const { error } = await supabase.from('assignments').delete().eq('id', asgId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Delete assignment error:', err);
    return NextResponse.json({ error: 'Failed to delete assignment.' }, { status: 500 });
  }
}

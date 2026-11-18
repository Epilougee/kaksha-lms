import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { deleteDemoUser } from '@/lib/demoData';

export async function DELETE(request, { params }) {
  const { errorResponse } = await requireRole('admin');
  if (errorResponse) return errorResponse;

  const userId = params.id;
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    await supabase.from('users').delete().eq('id', userId);
  } catch (err) {
    console.warn('Database delete notice:', err.message);
  }

  deleteDemoUser(userId);

  return NextResponse.json({ success: true, message: 'User deleted successfully.' });
}

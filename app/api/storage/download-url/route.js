import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { createDownloadUrl } from '@/lib/storage';

// Verify access rules before returning a signed download URL (valid for 60 seconds)
export async function GET(request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required.' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Check 1: Is this file attached to a lesson?
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id, course_id, courses!inner(teacher_id)')
      .eq('file_path', filePath)
      .single();

    if (lesson) {
      if (user.role === 'teacher' && lesson.courses?.teacher_id === user.id) {
        // Teacher owns the course
        const signedUrl = await createDownloadUrl(filePath, 60);
        return NextResponse.json({ signedUrl });
      }

      if (user.role === 'student') {
        // Student must be enrolled in course
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('course_id', lesson.course_id)
          .eq('student_id', user.id)
          .single();

        if (enrollment) {
          const signedUrl = await createDownloadUrl(filePath, 60);
          return NextResponse.json({ signedUrl });
        }
      }
    }

    // Check 2: Is this file attached to a submission?
    const { data: submission } = await supabase
      .from('submissions')
      .select('id, student_id, assignments!inner(course_id, courses!inner(teacher_id))')
      .eq('file_path', filePath)
      .single();

    if (submission) {
      if (submission.student_id === user.id) {
        // Student owns submission
        const signedUrl = await createDownloadUrl(filePath, 60);
        return NextResponse.json({ signedUrl });
      }

      if (user.role === 'teacher' && submission.assignments?.courses?.teacher_id === user.id) {
        // Teacher owns the course
        const signedUrl = await createDownloadUrl(filePath, 60);
        return NextResponse.json({ signedUrl });
      }
    }

    return NextResponse.json({ error: 'Access denied to this file.' }, { status: 403 });
  } catch (err) {
    console.error('Download file error:', err);
    return NextResponse.json({ error: 'Failed to authorize download.' }, { status: 500 });
  }
}

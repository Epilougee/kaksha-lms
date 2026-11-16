import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { assignmentStatus, gradePercent } from '@/lib/learningEngine';
import { createDownloadUrl } from '@/lib/storage';

// Get individual assignment details for enrolled student
export async function GET(request, { params }) {
  const { user, errorResponse } = await requireRole('student');
  if (errorResponse) return errorResponse;

  try {
    const asgId = Number(params.id);
    const supabase = getSupabase();

    const { data: assignment, error: aErr } = await supabase
      .from('assignments')
      .select('*, courses(id, title, code, color_index, users!courses_teacher_id_fkey(name))')
      .eq('id', asgId)
      .single();

    if (aErr || !assignment) {
      return NextResponse.json({ error: 'Assignment not found.' }, { status: 404 });
    }

    // Verify student is enrolled in the assignment's course
    const { data: enrollment, error: eErr } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', assignment.course_id)
      .eq('student_id', user.id)
      .single();

    if (eErr || !enrollment) {
      return NextResponse.json({ error: 'You are not enrolled in this course.' }, { status: 403 });
    }

    // Fetch existing submission
    const { data: submission } = await supabase
      .from('submissions')
      .select('*')
      .eq('assignment_id', asgId)
      .eq('student_id', user.id)
      .single();

    const now = new Date();
    const statusObj = assignmentStatus(assignment, submission, now);
    const isLocked = now.getTime() > new Date(assignment.due_at).getTime() && Boolean(submission);

    let fileDownloadUrl = null;
    if (submission?.file_path) {
      try {
        fileDownloadUrl = await createDownloadUrl(submission.file_path, 60);
      } catch {
        fileDownloadUrl = null;
      }
    }

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        instructions: assignment.instructions,
        due_at: assignment.due_at,
        max_marks: assignment.max_marks,
        courseId: assignment.course_id,
        courseTitle: assignment.courses?.title || '',
        courseCode: assignment.courses?.code || '',
        teacherName: assignment.courses?.users?.name || 'Faculty',
        status: statusObj.status,
        isLate: statusObj.isLate,
        isLocked,
      },
      submission: submission
        ? {
            id: submission.id,
            text_answer: submission.text_answer,
            file_path: submission.file_path,
            fileDownloadUrl,
            submitted_at: submission.submitted_at,
            marks: submission.marks,
            feedback: submission.feedback,
            graded_at: submission.graded_at,
            gradePercent: gradePercent(submission, assignment),
          }
        : null,
    });
  } catch (err) {
    console.error('Assignment detail error:', err);
    return NextResponse.json({ error: 'Failed to load assignment details.' }, { status: 500 });
  }
}

// Submit or resubmit assignment solution (student can resubmit until due date passes)
export async function POST(request, { params }) {
  const { user, errorResponse } = await requireRole('student');
  if (errorResponse) return errorResponse;

  try {
    const asgId = Number(params.id);
    const { text_answer, file_path } = await request.json();
    const supabase = getSupabase();

    const { data: assignment, error: aErr } = await supabase
      .from('assignments')
      .select('id, course_id, due_at')
      .eq('id', asgId)
      .single();

    if (aErr || !assignment) {
      return NextResponse.json({ error: 'Assignment not found.' }, { status: 404 });
    }

    // Verify enrollment
    const { data: enrollment, error: eErr } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', assignment.course_id)
      .eq('student_id', user.id)
      .single();

    if (eErr || !enrollment) {
      return NextResponse.json({ error: 'You are not enrolled in this course.' }, { status: 403 });
    }

    // Check existing submission
    const { data: existingSub } = await supabase
      .from('submissions')
      .select('id, submitted_at, marks')
      .eq('assignment_id', asgId)
      .eq('student_id', user.id)
      .single();

    const now = new Date();
    const dueTime = new Date(assignment.due_at).getTime();

    // Lock rule: if student already submitted and due date has passed, submission is locked
    if (existingSub && now.getTime() > dueTime) {
      return NextResponse.json(
        { error: 'This assignment is locked. The due date has passed.' },
        { status: 400 }
      );
    }

    // Insert or update submission
    const { data, error: subErr } = await supabase
      .from('submissions')
      .upsert(
        {
          assignment_id: asgId,
          student_id: user.id,
          text_answer: text_answer || null,
          file_path: file_path || existingSub?.file_path || null,
          submitted_at: now.toISOString(),
          // Clear any previous grades upon resubmission
          marks: null,
          feedback: null,
          graded_at: null,
        },
        { onConflict: 'assignment_id,student_id' }
      )
      .select()
      .single();

    if (subErr) throw subErr;

    return NextResponse.json({ ok: true, submission: data });
  } catch (err) {
    console.error('Submit assignment error:', err);
    return NextResponse.json({ error: 'Failed to submit assignment.' }, { status: 500 });
  }
}

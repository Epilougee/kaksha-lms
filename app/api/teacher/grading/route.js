import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { assignmentStatus, gradePercent } from '@/lib/learningEngine';
import { createDownloadUrl } from '@/lib/storage';

// Get submissions list for an assignment with late tags and grade statuses
export async function GET(request) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const asgIdParam = searchParams.get('assignmentId');

    const supabase = getSupabase();

    // 1. Fetch courses owned by teacher
    const { data: courses, error: cErr } = await supabase
      .from('courses')
      .select('id, title, code')
      .eq('teacher_id', user.id);

    if (cErr) throw cErr;

    const courseIds = (courses || []).map((c) => c.id);
    if (courseIds.length === 0) {
      return NextResponse.json({ courses: [], assignments: [], submissions: [] });
    }

    // 2. Fetch assignments of owned courses
    const { data: assignments, error: aErr } = await supabase
      .from('assignments')
      .select('*')
      .in('course_id', courseIds)
      .order('due_at', { ascending: false });

    if (aErr) throw aErr;

    const selectedAsgId = asgIdParam ? Number(asgIdParam) : assignments[0]?.id || null;
    const currentAsg = (assignments || []).find((a) => a.id === selectedAsgId);

    if (!currentAsg) {
      return NextResponse.json({
        courses,
        assignments: assignments || [],
        selectedAssignment: null,
        submissions: [],
      });
    }

    // 3. Fetch submissions for current assignment
    const [
      { data: submissions, error: subErr },
      { data: students, error: stuErr },
    ] = await Promise.all([
      supabase.from('submissions').select('*').eq('assignment_id', currentAsg.id).order('submitted_at'),
      supabase.from('users').select('id, name, email').eq('role', 'student'),
    ]);

    if (subErr) throw subErr;
    if (stuErr) throw stuErr;

    const studentMap = new Map((students || []).map((s) => [s.id, s]));
    const now = new Date();

    const enrichedSubmissions = await Promise.all(
      (submissions || []).map(async (sub) => {
        const student = studentMap.get(sub.student_id);
        const statusObj = assignmentStatus(currentAsg, sub, now);
        let downloadUrl = null;

        if (sub.file_path) {
          try {
            downloadUrl = await createDownloadUrl(sub.file_path, 60);
          } catch {
            downloadUrl = null;
          }
        }

        return {
          id: sub.id,
          assignment_id: sub.assignment_id,
          student_id: sub.student_id,
          studentName: student?.name || 'Student',
          studentEmail: student?.email || '',
          text_answer: sub.text_answer,
          file_path: sub.file_path,
          fileDownloadUrl: downloadUrl,
          submitted_at: sub.submitted_at,
          marks: sub.marks,
          feedback: sub.feedback,
          graded_at: sub.graded_at,
          gradePercent: gradePercent(sub, currentAsg),
          isLate: statusObj.isLate,
          status: statusObj.status,
        };
      })
    );

    return NextResponse.json({
      courses,
      assignments: assignments || [],
      selectedAssignment: currentAsg,
      submissions: enrichedSubmissions,
    });
  } catch (err) {
    console.warn('Teacher grading using demo fallback:', err.message);
    const { DEMO_COURSES, DEMO_ASSIGNMENTS } = await import('@/lib/demoData');
    return NextResponse.json({
      courses: DEMO_COURSES,
      assignments: DEMO_ASSIGNMENTS,
      selectedAssignment: DEMO_ASSIGNMENTS[0],
      submissions: [
        {
          id: 1,
          assignment_id: 1,
          student_id: 3,
          studentName: 'Aarav Sharma',
          studentEmail: 'student1@demo.com',
          text_answer: 'Created the CLI file parser using argparse and csv modules with try/except validation.',
          file_path: null,
          fileDownloadUrl: null,
          submitted_at: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
          marks: 46,
          feedback: 'Excellent work. Well formatted and comprehensive tests included.',
          graded_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
          gradePercent: 92,
          isLate: false,
          status: 'Graded',
        },
        {
          id: 2,
          assignment_id: 1,
          student_id: 5,
          studentName: 'Rohan Kulkarni',
          studentEmail: 'student3@demo.com',
          text_answer: 'Attached Python script handling dynamic delimiter detection.',
          file_path: null,
          fileDownloadUrl: null,
          submitted_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          marks: null,
          feedback: null,
          graded_at: null,
          gradePercent: null,
          isLate: false,
          status: 'Submitted',
        },
      ],
    });
  }
}

// Grade or update marks and feedback for a submission
export async function POST(request) {
  const { user, errorResponse } = await requireRole('teacher');
  if (errorResponse) return errorResponse;

  try {
    const { submissionId, marks, feedback } = await request.json();

    if (!submissionId || marks === undefined || marks === null) {
      return NextResponse.json({ error: 'Submission ID and marks are required.' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Verify teacher owns the course for this submission
    const { data: sub, error: subErr } = await supabase
      .from('submissions')
      .select('id, assignment_id, assignments!inner(max_marks, courses!inner(teacher_id))')
      .eq('id', Number(submissionId))
      .single();

    if (subErr || !sub || sub.assignments?.courses?.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Submission not found or access denied.' }, { status: 403 });
    }

    const maxMarks = Number(sub.assignments?.max_marks || 100);
    const numMarks = Number(marks);

    if (Number.isNaN(numMarks) || numMarks < 0 || numMarks > maxMarks) {
      return NextResponse.json(
        { error: `Marks must be between 0 and max marks (${maxMarks}).` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('submissions')
      .update({
        marks: numMarks,
        feedback: feedback?.trim() || null,
        graded_at: now,
      })
      .eq('id', Number(submissionId))
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, submission: data });
  } catch (err) {
    console.error('Grade submission error:', err);
    return NextResponse.json({ error: 'Failed to save grade.' }, { status: 500 });
  }
}

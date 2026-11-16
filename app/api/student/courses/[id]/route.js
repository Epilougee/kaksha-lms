import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { courseProgress, assignmentStatus, gradePercent } from '@/lib/learningEngine';
import { createDownloadUrl } from '@/lib/storage';

// Return detailed course page data for enrolled student (Lessons, Materials, Assignments)
export async function GET(request, { params }) {
  const { user, errorResponse } = await requireRole('student');
  if (errorResponse) return errorResponse;

  try {
    const courseId = Number(params.id);
    const supabase = getSupabase();

    // Verify enrollment
    const { data: enrollment, error: eErr } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('student_id', user.id)
      .single();

    if (eErr || !enrollment) {
      return NextResponse.json({ error: 'You are not enrolled in this course.' }, { status: 403 });
    }

    // Fetch course details, lessons, progress, assignments, and student's submissions
    const [
      { data: course, error: cErr },
      { data: lessons, error: lErr },
      { data: progressRows, error: pErr },
      { data: assignments, error: aErr },
      { data: submissions, error: sErr },
    ] = await Promise.all([
      supabase.from('courses').select('*, users!courses_teacher_id_fkey(name)').eq('id', courseId).single(),
      supabase.from('lessons').select('*').eq('course_id', courseId).order('order_no'),
      supabase.from('lesson_progress').select('lesson_id').eq('student_id', user.id),
      supabase.from('assignments').select('*').eq('course_id', courseId).order('due_at'),
      supabase.from('submissions').select('*').eq('student_id', user.id),
    ]);

    if (cErr) throw cErr;
    if (lErr) throw lErr;
    if (pErr) throw pErr;
    if (aErr) throw aErr;
    if (sErr) throw sErr;

    const completedLessonIds = new Set((progressRows || []).map((p) => p.lesson_id));
    const now = new Date();

    // Generate signed download URLs for private material files if needed
    const lessonsWithStatus = await Promise.all(
      (lessons || []).map(async (lesson) => {
        let downloadUrl = null;
        if (lesson.type === 'material' && lesson.file_path) {
          try {
            downloadUrl = await createDownloadUrl(lesson.file_path, 60);
          } catch {
            downloadUrl = null;
          }
        }
        return {
          ...lesson,
          isCompleted: completedLessonIds.has(lesson.id),
          downloadUrl: downloadUrl || lesson.url || null,
        };
      })
    );

    const subByAsgId = new Map((submissions || []).map((s) => [s.assignment_id, s]));
    const assignmentsWithStatus = (assignments || []).map((a) => {
      const sub = subByAsgId.get(a.id) || null;
      const statusObj = assignmentStatus(a, sub, now);
      return {
        ...a,
        submission: sub
          ? {
              id: sub.id,
              submitted_at: sub.submitted_at,
              marks: sub.marks,
              max_marks: a.max_marks,
              feedback: sub.feedback,
              graded_at: sub.graded_at,
              gradePercent: gradePercent(sub, a),
            }
          : null,
        status: statusObj.status,
        isLate: statusObj.isLate,
      };
    });

    const progress = courseProgress(lessons || [], Array.from(completedLessonIds));

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        code: course.code,
        description: course.description,
        color_index: course.color_index,
        teacherName: course.users?.name || 'Faculty',
        progress,
      },
      lessons: lessonsWithStatus,
      assignments: assignmentsWithStatus,
    });
  } catch (err) {
    console.warn('Course detail using demo fallback:', err.message);
    const { DEMO_COURSES, DEMO_LESSONS, DEMO_ASSIGNMENTS } = await import('@/lib/demoData');
    const courseId = Number(params.id) || 1;
    const course = DEMO_COURSES.find((c) => c.id === courseId) || DEMO_COURSES[0];
    const courseLessons = DEMO_LESSONS.filter((l) => l.course_id === course.id);
    const courseAssignments = DEMO_ASSIGNMENTS.filter((a) => a.course_id === course.id);

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        code: course.code,
        description: course.description,
        color_index: course.color_index,
        teacherName: course.teacher.name,
        progress: user?.email === 'student1@demo.com' ? 83 : 33,
      },
      lessons: courseLessons.map((l, idx) => ({
        ...l,
        isCompleted: user?.email === 'student1@demo.com' ? idx < courseLessons.length - 1 : idx === 0,
      })),
      assignments: courseAssignments.map((a) => ({
        ...a,
        submission: null,
        status: 'Pending',
        isLate: false,
        gradePercent: null,
      })),
    });
  }
}

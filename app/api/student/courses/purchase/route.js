import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { purchaseDemoCourse } from '@/lib/demoData';

export async function POST(request) {
  const { user, errorResponse } = await requireRole('student');
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { courseId, paymentMethod, transactionId, amount } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required.' }, { status: 400 });
    }

    const txId = transactionId || `TXN_KP_${Date.now()}_${Math.floor(Math.random() * 8999 + 1000)}`;
    const paidAmount = Number(amount) || 0;

    const supabase = getSupabase();

    // Check if course exists
    const { data: course, error: cErr } = await supabase
      .from('courses')
      .select('id, title, code, price')
      .eq('id', courseId)
      .single();

    if (cErr || !course) throw new Error('Course not found');

    // Insert into enrollments
    const { data: enrollment, error: insErr } = await supabase
      .from('enrollments')
      .insert({
        course_id: course.id,
        student_id: user.id,
        payment_id: txId,
        amount_paid: paidAmount || course.price || 0,
      })
      .select()
      .single();

    if (insErr) {
      // Check if already enrolled (unique violation 23505)
      if (insErr.code === '23505') {
        return NextResponse.json(
          { error: 'You are already enrolled in this course.' },
          { status: 409 }
        );
      }
      throw insErr;
    }

    // Also update demo state in memory
    purchaseDemoCourse(user, courseId, { transactionId: txId, amount: paidAmount });

    return NextResponse.json({
      success: true,
      message: 'Course purchased successfully!',
      transactionId: txId,
      courseTitle: course.title,
      amount: paidAmount || course.price,
      enrolledAt: enrollment.joined_at,
    });
  } catch (err) {
    console.warn('Purchase demo fallback:', err.message);
    const body = await request.clone().json().catch(() => ({}));
    const courseId = body.courseId;
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required.' }, { status: 400 });
    }

    const txId = body.transactionId || `TXN_KP_${Date.now()}_${Math.floor(Math.random() * 8999 + 1000)}`;
    const result = purchaseDemoCourse(user, courseId, {
      transactionId: txId,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
    });

    return NextResponse.json({
      success: true,
      message: 'Course purchased and enrolled successfully (Demo Mode)!',
      transactionId: result.transactionId,
      courseTitle: result.courseTitle,
      amount: result.amount,
      enrolledAt: result.enrolledAt,
    });
  }
}

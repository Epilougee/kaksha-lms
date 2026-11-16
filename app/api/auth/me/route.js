import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// Return basic profile of signed-in user
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

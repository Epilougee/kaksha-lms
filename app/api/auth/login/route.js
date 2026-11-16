import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import {
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from '@/lib/auth';
import { DEMO_USERS } from '@/lib/demoData';

// Authenticate student or teacher with email and password, setting signed HTTP-only cookie
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    let authenticatedUser = null;

    // 1. Attempt database lookup
    try {
      const supabase = getSupabase();
      const { data: dbUser, error: dbErr } = await supabase
        .from('users')
        .select('id, name, email, password_hash, role')
        .eq('email', cleanEmail)
        .single();

      if (!dbErr && dbUser) {
        const valid = await verifyPassword(password, dbUser.password_hash);
        if (valid) {
          authenticatedUser = dbUser;
        }
      }
    } catch {
      // Database unavailable or not yet initialized
    }

    // 2. Demo fallback if database is empty or not yet seeded
    if (!authenticatedUser) {
      const demoMatch = DEMO_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
      if (demoMatch && password === 'demo123') {
        authenticatedUser = {
          id: demoMatch.id,
          name: demoMatch.name,
          email: demoMatch.email,
          role: demoMatch.role,
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken(authenticatedUser);
    const response = NextResponse.json({
      user: {
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        role: authenticatedUser.role,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Unable to sign in right now.' },
      { status: 500 }
    );
  }
}

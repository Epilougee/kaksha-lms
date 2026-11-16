import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const SESSION_COOKIE_NAME = 'kaksha_session';

// Encode session secret from environment variables
function getSecretKey() {
  const secret = process.env.SESSION_SECRET || 'kaksha-super-secure-secret-key-32-chars-long';
  return new TextEncoder().encode(secret);
}

// Hash plain text password using bcryptjs
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Verify plain text password against bcrypt hash
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Create a signed JWT session cookie for user
export async function createSessionToken(user) {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey());
}

// Verify JWT session token and return payload
export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}

// Read current user session from HTTP-only cookie
export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

// Route guard requiring authentication and optional role
export async function requireRole(expectedRole) {
  const user = await getSession();
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Not signed in' }, { status: 401 }),
    };
  }
  if (expectedRole && user.role !== expectedRole) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Access denied' }, { status: 403 }),
    };
  }
  return { user, errorResponse: null };
}

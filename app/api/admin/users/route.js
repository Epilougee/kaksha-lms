import { NextResponse } from 'next/server';
import { requireRole, hashPassword } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { getAllUsers, createDemoUser, DEMO_COURSES } from '@/lib/demoData';

// GET all users (with optional ?role=teacher or ?role=student filter) and system stats
export async function GET(request) {
  const { errorResponse } = await requireRole('admin');
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const roleFilter = searchParams.get('role'); // 'teacher' | 'student' | null
  const dbRoleFilter = roleFilter === 'teacher' ? 'faculty' : roleFilter;

  try {
    const supabase = getSupabase();
    let query = supabase.from('users').select('id, name, email, role');
    if (dbRoleFilter) {
      query = query.in('role', roleFilter === 'teacher' ? ['teacher', 'faculty'] : [roleFilter]);
    }
    const { data: dbUsers, error: dbErr } = await query.order('id', { ascending: false });
    if (dbErr) throw dbErr;

    const { data: courses } = await supabase.from('courses').select('id');

    // Also get in-memory users that might not be in db yet
    const allUsers = getAllUsers();
    const dbEmailSet = new Set((dbUsers || []).map((u) => u.email.toLowerCase()));
    const merged = [
      ...(dbUsers || []).map((u) => {
        const normalizedRole = u.role === 'faculty' ? 'teacher' : u.role;
        return {
          ...u,
          role: normalizedRole,
          department: normalizedRole === 'teacher' ? 'Computer Applications' : 'BCA Academic Stream',
          status: 'Active',
        };
      }),
      ...allUsers
        .filter((u) => !dbEmailSet.has(u.email.toLowerCase()))
        .filter((u) => (roleFilter ? u.role === roleFilter : true)),
    ];

    const facultyCount = merged.filter((u) => u.role === 'teacher').length;
    const studentCount = merged.filter((u) => u.role === 'student').length;

    return NextResponse.json({
      users: merged,
      stats: {
        totalUsers: merged.length,
        facultyCount,
        studentCount,
        courseCount: (courses || DEMO_COURSES).length,
      },
    });
  } catch (err) {
    console.warn('Admin users using demo fallback:', err.message);
    const all = getAllUsers();
    const filtered = roleFilter ? all.filter((u) => u.role === roleFilter) : all;
    return NextResponse.json({
      users: filtered,
      stats: {
        totalUsers: all.length,
        facultyCount: all.filter((u) => u.role === 'teacher').length,
        studentCount: all.filter((u) => u.role === 'student').length,
        courseCount: DEMO_COURSES.length,
      },
    });
  }
}

// POST: Add a new faculty member or student with name, email, and password
export async function POST(request) {
  const { errorResponse } = await requireRole('admin');
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { name, email, password, role, department } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }
    if (!password || password.trim().length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters.' }, { status: 400 });
    }
    if (!role || !['teacher', 'student'].includes(role)) {
      return NextResponse.json({ error: 'Role must be either Faculty (teacher) or Student.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const passwordHash = await hashPassword(password.trim());
    const dbRole = role === 'teacher' ? 'faculty' : role;

    let createdId = null;

    // 1. Attempt insertion into Supabase (supporting both 'faculty' and 'teacher' schema constraints)
    try {
      const supabase = getSupabase();
      let insertResult = await supabase
        .from('users')
        .insert({
          name: name.trim(),
          email: cleanEmail,
          password_hash: passwordHash,
          role: dbRole,
        })
        .select()
        .single();

      // If constraint fails on dbRole, try standard 'teacher'
      if (insertResult.error && insertResult.error.code === '23514' && dbRole !== role) {
        insertResult = await supabase
          .from('users')
          .insert({
            name: name.trim(),
            email: cleanEmail,
            password_hash: passwordHash,
            role: role,
          })
          .select()
          .single();
      }

      if (insertResult.error) {
        if (insertResult.error.code === '23505') {
          return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 409 });
        }
        console.warn('Supabase user insert notice:', insertResult.error.message);
      } else if (insertResult.data) {
        createdId = insertResult.data.id;
      }
    } catch (err) {
      console.warn('Database insert skipped, using memory store:', err.message);
    }

    // 2. Add to in-memory store so they can log in immediately in demo mode as well
    const demoUser = createDemoUser({
      name: name.trim(),
      email: cleanEmail,
      role,
      password: password.trim(),
      department,
    });

    return NextResponse.json({
      success: true,
      message: `${role === 'teacher' ? 'Faculty' : 'Student'} account created successfully.`,
      user: {
        id: createdId || demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        department: demoUser.department,
        status: demoUser.status,
      },
    });
  } catch (err) {
    console.error('Error creating user:', err);
    return NextResponse.json({ error: err.message || 'Failed to create user.' }, { status: 500 });
  }
}

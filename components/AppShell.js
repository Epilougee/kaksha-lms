'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const STUDENT_NAV = [
  { href: '/student', label: 'Dashboard', icon: 'fa-solid fa-gauge' },
  { href: '/student/courses', label: 'My Courses', icon: 'fa-solid fa-book-open' },
  { href: '/student/live', label: 'Live Classes', icon: 'fa-solid fa-video' },
  { href: '/student/assignments', label: 'Assignments', icon: 'fa-solid fa-file-pen' },
];

const TEACHER_NAV = [
  { href: '/teacher', label: 'Dashboard', icon: 'fa-solid fa-gauge' },
  { href: '/teacher/courses', label: 'Courses', icon: 'fa-solid fa-book-open' },
  { href: '/teacher/live', label: 'Live Classes', icon: 'fa-solid fa-video' },
  { href: '/teacher/grading', label: 'Grading', icon: 'fa-solid fa-clipboard-check' },
  { href: '/teacher/students', label: 'Students', icon: 'fa-solid fa-users' },
];

// Dark Ink sidebar navigation layout shell with Plus Jakarta Sans and mobile drawer
export default function AppShell({ title, requiredRole, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        if (!data || !data.user) {
          router.replace('/login');
          return;
        }
        if (requiredRole && data.user.role !== requiredRole) {
          router.replace(data.user.role === 'teacher' ? '/teacher' : '/student');
          return;
        }
        setUser(data.user);
      })
      .catch(() => {
        if (active) router.replace('/login');
      });

    return () => {
      active = false;
    };
  }, [requiredRole, router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  const navItems = user?.role === 'teacher' ? TEACHER_NAV : STUDENT_NAV;

  return (
    <div className="app-shell">
      <div
        className={`sidebar-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <div className="sidebar-brand-icon">
                <i className="fa-solid fa-graduation-cap" />
              </div>
              <span>Kaksha</span>
            </div>
            <span className="sidebar-dept-pill">BCA Dept</span>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-label">Academic Portal</div>
            {navItems.map((item) => {
              const isActive =
                item.href === '/student' || item.href === '/teacher'
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <i className={item.icon} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', borderColor: '#334155', color: '#CBD5E1', background: 'transparent' }}
            onClick={handleLogout}
          >
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              <i className="fa-solid fa-bars" />
            </button>
            <h1 className="topbar-title">{title}</h1>
          </div>

          <div className="topbar-user">
            {user ? (
              <>
                <span className="role-badge">{user.role}</span>
                <span style={{ fontWeight: 600 }}>{user.name}</span>
              </>
            ) : (
              <span className="muted">Loading...</span>
            )}
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}

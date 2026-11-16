'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import CourseCover from '@/components/CourseCover';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch('/api/teacher/courses');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load courses.');
        setCourses(data.courses || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  function copyJoinCode(code) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  }

  return (
    <AppShell title="Managed Courses" requiredRole="teacher">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>Managed Course Modules</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
            Create and oversee your syllabi, video lectures, and learning materials.
          </p>
        </div>

        <Link href="/teacher/courses/new" className="btn btn-primary">
          <i className="fa-solid fa-plus" />
          <span>Create New Course</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading your courses...</div>
      ) : courses.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <i className="fa-solid fa-book-open" />
            <p>No active courses found. Create your first instructional module.</p>
            <Link href="/teacher/courses/new" className="btn btn-primary" style={{ marginTop: 12 }}>
              <i className="fa-solid fa-plus" />
              <span>Create Course</span>
            </Link>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          {courses.map((course) => (
            <div
              key={course.id}
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
              }}
            >
              <CourseCover
                code={course.code}
                title={course.title}
                colorIndex={course.color_index}
                height={120}
              />

              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    {course.title}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 16 }}>
                    {course.description || 'Comprehensive curriculum with video lectures, assignments, and notes.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      Join Code:
                      <button
                        type="button"
                        onClick={() => copyJoinCode(course.join_code)}
                        style={{
                          marginLeft: 6,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: '#EBF2FE',
                          color: 'var(--primary)',
                          border: 'none',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                        }}
                        title="Click to copy join code"
                      >
                        {course.join_code}
                        <i className={`fa-solid ${copiedCode === course.join_code ? 'fa-check' : 'fa-copy'}`} style={{ marginLeft: 6, fontSize: 11 }} />
                      </button>
                    </div>

                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {course.enrolledCount ?? 12} enrolled
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <Link
                      href={`/teacher/courses/${course.id}`}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <i className="fa-solid fa-pen-to-square" />
                      <span>Edit Syllabus</span>
                    </Link>

                    <Link
                      href={`/teacher/grading`}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <i className="fa-solid fa-clipboard-check" />
                      <span>Grading</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

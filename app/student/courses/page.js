'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import CourseCover from '@/components/CourseCover';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [search, setSearch] = useState('');

  async function loadCourses() {
    try {
      const res = await fetch('/api/student/courses');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load courses.');
      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleJoinCourse(e) {
    e.preventDefault();
    setJoinError('');
    setJoining(true);

    try {
      const res = await fetch('/api/student/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join course.');
      setModalOpen(false);
      setJoinCode('');
      await loadCourses();
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setJoining(false);
    }
  }

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      c.code.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <AppShell title="My Courses" requiredRole="student">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Academic Enrolment
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Session 2024-25 &middot; Semester IV Courses
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="search"
            className="input"
            style={{ width: '240px', height: '40px' }}
            placeholder="Search code or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary"
            style={{ height: '40px' }}
            onClick={() => setModalOpen(true)}
          >
            <i className="fa-solid fa-plus" />
            <span>Join Course</span>
          </button>
        </div>
      </div>

      {loading && <div className="card">Loading courses...</div>}

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card empty-state">
          <i className="fa-solid fa-book-open" />
          <p>No courses match your search or you have not enrolled yet.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
            Join With Code
          </button>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="courses-grid">
          {filtered.map((course) => (
            <article key={course.id} className="course-card">
              <CourseCover code={course.code} title={course.title} colorIndex={course.color_index} height={135} />

              <div className="course-card-body">
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
                    {course.title}
                  </h2>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                    Instructor: <strong>{course.teacherName}</strong>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    <span style={{ color: 'var(--muted)' }}>Completion</span>
                    <span style={{ color: 'var(--primary)' }}>{course.progress}%</span>
                  </div>
                  <div className="progress-track" style={{ marginBottom: '16px' }}>
                    <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                  </div>

                  <Link href={`/student/courses/${course.id}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                    <span>Open Course</span>
                    <i className="fa-solid fa-arrow-right" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Join Course Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Join Course</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '16px' }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
              Enter the unique course code provided by your instructor (e.g., PY402, DB401, DS301).
            </p>

            {joinError && (
              <div className="alert alert-error">
                <i className="fa-solid fa-circle-exclamation" />
                <span>{joinError}</span>
              </div>
            )}

            <form onSubmit={handleJoinCourse}>
              <div className="form-group">
                <label className="form-label" htmlFor="joinCode">Course Join Code</label>
                <input
                  id="joinCode"
                  type="text"
                  className="input"
                  placeholder="e.g. PY402"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={joining}>
                  {joining ? 'Enrolling...' : 'Join Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

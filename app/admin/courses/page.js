'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import CourseCover from '@/components/CourseCover';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  async function loadCourses() {
    try {
      const res = await fetch('/api/student/courses/catalog');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch course catalog');
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

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell title="Institutional Course Catalog" requiredRole="admin">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Academic Course Offerings
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Curriculum overview across core subjects and departmental electives.
          </p>
        </div>

        <input
          type="search"
          className="input"
          style={{ width: '240px', height: '40px' }}
          placeholder="Search course code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card">Loading courses...</div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <i className="fa-solid fa-book" />
          <p>No courses found.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filtered.map((course) => (
            <article key={course.id} className="course-card">
              <CourseCover code={course.code} title={course.title} colorIndex={course.color_index} height={135} />

              <div className="course-card-body">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', background: '#EBF2FE', padding: '2px 6px', borderRadius: '4px' }}>
                      {course.code}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: course.price > 0 ? '#92400E' : '#15803D', background: course.price > 0 ? '#FEF3C7' : '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                      {course.price > 0 ? `₹${course.price}` : 'Core / Free'}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
                    {course.title}
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                    Instructor: <strong>{course.teacherName}</strong>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'var(--muted)' }}>
                    Join Code: <strong style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{course.join_code}</strong>
                  </span>
                  <span style={{ color: 'var(--muted)' }}>
                    {course.lessonsCount || 6} Lessons
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}

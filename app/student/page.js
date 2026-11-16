'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import ProgressRing from '@/components/ProgressRing';
import CourseCover from '@/components/CourseCover';
import { formatIST } from '@/lib/time';

export default function StudentDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/student/dashboard')
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load dashboard.');
        return json;
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="Student Dashboard" requiredRole="student">
      {loading && <div className="card">Loading academic progress...</div>}

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {data && (
        <>
          {/* 1. Continue Learning (Next Up) Card */}
          {data.nextUp && (
            <div className="continue-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ maxWidth: '640px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: '#EBF2FE', color: 'var(--primary)', padding: '3px 8px', borderRadius: '4px' }}>
                      {data.nextUp.courseCode}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                      {data.nextUp.reason}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: '6px' }}>
                    {data.nextUp.title}
                  </h2>

                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px' }}>
                    Course: <strong style={{ color: 'var(--text)' }}>{data.nextUp.courseTitle}</strong>
                    {data.nextUp.starts_at && ` · Starts ${formatIST(data.nextUp.starts_at)}`}
                    {data.nextUp.due_at && ` · Due ${formatIST(data.nextUp.due_at)}`}
                  </p>
                </div>

                <Link href={data.nextUp.href} className="btn btn-primary" style={{ height: '42px', padding: '0 20px' }}>
                  <i className={data.nextUp.type === 'live_session' ? 'fa-solid fa-video' : data.nextUp.type === 'assignment' ? 'fa-solid fa-file-pen' : 'fa-solid fa-play'} />
                  <span>{data.nextUp.actionLabel}</span>
                </Link>
              </div>
            </div>
          )}

          {/* 2. Four Metric Stat Cards (with Attendance) */}
          <div className="stats-grid">
            <div className="stat-card">
              <div>
                <div className="stat-label">Enrolled Courses</div>
                <div className="stat-value">{data.stats.coursesCount} Active</div>
                <div className="stat-sub">Semester Academic Cycle</div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EBF2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '20px' }}>
                <i className="fa-solid fa-book-open" />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Average Progress</div>
                <div className="stat-value">{data.stats.avgProgress}%</div>
                <div className="stat-sub">Across theoretical units</div>
              </div>
              <ProgressRing percent={data.stats.avgProgress} size={54} strokeWidth={5} />
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Semester Attendance</div>
                <div
                  className="stat-value"
                  style={{
                    color: (data.stats.attendancePercent ?? 89) >= 75 ? 'var(--success)' : 'var(--danger)',
                  }}
                >
                  {data.stats.attendancePercent ?? 89}%
                </div>
                <div className="stat-sub">
                  {(data.stats.attendancePercent ?? 89) >= 75
                    ? `${data.stats.attendedClasses ?? 38}/${data.stats.totalClasses ?? 42} Attended (Eligible ≥75%)`
                    : `${data.stats.attendedClasses ?? 27}/${data.stats.totalClasses ?? 42} Attended (Shortage <75%)`}
                </div>
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: (data.stats.attendancePercent ?? 89) >= 75 ? '#ECFDF5' : '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: (data.stats.attendancePercent ?? 89) >= 75 ? 'var(--success)' : 'var(--danger)',
                  fontSize: '20px',
                }}
              >
                <i className={`fa-solid ${(data.stats.attendancePercent ?? 89) >= 75 ? 'fa-clipboard-user' : 'fa-triangle-exclamation'}`} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Pending Tasks</div>
                <div className="stat-value" style={{ color: data.stats.pendingTasks > 0 ? 'var(--amber)' : 'var(--text)' }}>
                  {data.stats.pendingTasks}
                </div>
                <div className="stat-sub">Assignments awaiting submission</div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)', fontSize: '20px' }}>
                <i className="fa-solid fa-clock" />
              </div>
            </div>
          </div>

          {/* 3. Course Progress Grid & Upcoming Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Enrolled Course Progress */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Enrolled Courses</h2>
                <Link href="/student/courses" className="btn btn-outline btn-sm">
                  View All
                </Link>
              </div>

              {data.courses.length === 0 ? (
                <div className="empty-state">
                  <i className="fa-solid fa-graduation-cap" />
                  <p>Not enrolled in any course yet.</p>
                  <Link href="/student/courses" className="btn btn-primary btn-sm">
                    Join Course
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {data.courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/student/courses/${course.id}`}
                      style={{
                        padding: '14px',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        transition: 'all 160ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                            {course.code}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                            {course.completedLessons}/{course.totalLessons} lessons
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: (course.attendance ?? 88) >= 75 ? 'var(--success)' : 'var(--danger)', background: (course.attendance ?? 88) >= 75 ? '#ECFDF5' : '#FEF2F2', padding: '1px 6px', borderRadius: '4px' }}>
                            {course.attendance ?? 88}% Attd.
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {course.title}
                        </div>
                        <div className="progress-track" style={{ marginTop: '8px' }}>
                          <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                        </div>
                      </div>

                      <ProgressRing percent={course.progress} size={44} strokeWidth={4} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Section: Live Classes & Due Assignments */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Upcoming Schedule</h2>
                <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>IST</span>
              </div>

              {data.upcoming.length === 0 ? (
                <div className="empty-state">
                  <i className="fa-solid fa-calendar-check" />
                  <p>No upcoming classes or due tasks.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.upcoming.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      style={{
                        padding: '12px',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'background-color 160ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: item.type === 'session' ? '#EBF2FE' : '#FEF3C7',
                            color: item.type === 'session' ? 'var(--primary)' : 'var(--amber)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            flexShrink: 0,
                          }}
                        >
                          <i className={item.type === 'session' ? 'fa-solid fa-video' : 'fa-solid fa-file-pen'} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {item.courseCode} · {formatIST(item.date)}
                          </div>
                        </div>
                      </div>

                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', flexShrink: 0 }}>
                        {item.timeInfo}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

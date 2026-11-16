'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { AssignmentBarChart, GradeDonutChart } from '@/components/TeacherCharts';
import { formatIST } from '@/lib/time';

export default function TeacherDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/teacher/dashboard')
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load teacher stats.');
        return json;
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="Faculty Console" requiredRole="teacher">
      {loading && <div className="card">Loading instructional analytics...</div>}

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {data && (
        <>
          {/* Top 3 Stat Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div>
                <div className="stat-label">Active Courses</div>
                <div className="stat-value">{data.stats.coursesCount}</div>
                <div className="stat-sub">Instructional Modules Owned</div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EBF2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '20px' }}>
                <i className="fa-solid fa-chalkboard-user" />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Enrolled Students</div>
                <div className="stat-value">{data.stats.studentsCount}</div>
                <div className="stat-sub">Unique collegiate scholars</div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', fontSize: '20px' }}>
                <i className="fa-solid fa-users" />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Submissions to Grade</div>
                <div className="stat-value" style={{ color: data.stats.toGradeCount > 0 ? 'var(--amber)' : 'var(--text)' }}>
                  {data.stats.toGradeCount}
                </div>
                <div className="stat-sub">Awaiting evaluation & marks</div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)', fontSize: '20px' }}>
                <i className="fa-solid fa-clipboard-question" />
              </div>
            </div>
          </div>

          {/* Charts Row: Single-hue Bar Chart + Donut Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Average Score per Assignment</h2>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                    Calculated average % across all evaluated submissions
                  </p>
                </div>
              </div>
              {(data.stats.assignmentAverages || []).length === 0 ? (
                <div className="empty-state">
                  <i className="fa-solid fa-chart-column" />
                  <p>No graded submissions available for analytics.</p>
                </div>
              ) : (
                <AssignmentBarChart averages={data.stats.assignmentAverages} />
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Grade Distribution</h2>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                    Academic letter grade distribution (A, B, C, D, F)
                  </p>
                </div>
              </div>
              <GradeDonutChart distribution={data.stats.gradeDistribution || {}} />
            </div>
          </div>

          {/* Submissions Waiting to Be Graded & Quick Course Editor Access */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
            {/* Needs Grading List */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Needs Grading ({(data.stats.needsGrading || []).length})</h2>
                <Link href="/teacher/grading" className="btn btn-outline btn-sm">
                  Grading Console
                </Link>
              </div>

              {(data.stats.needsGrading || []).length === 0 ? (
                <div className="empty-state">
                  <i className="fa-solid fa-circle-check" />
                  <p>All student submissions have been evaluated and graded.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(data.stats.needsGrading || []).slice(0, 6).map((item) => (
                    <div
                      key={item.submissionId}
                      style={{
                        padding: '12px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>
                          {item.studentName}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {item.courseCode} · {item.assignmentTitle} · {formatIST(item.submitted_at)}
                        </div>
                      </div>

                      <Link href={`/teacher/grading?assignmentId=${item.assignmentId}`} className="btn btn-primary btn-sm">
                        Grade
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Managed Courses */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Managed Courses</h2>
                <Link href="/teacher/courses/new" className="btn btn-primary btn-sm">
                  <i className="fa-solid fa-plus" />
                  <span>Create Course</span>
                </Link>
              </div>

              {data.courses.length === 0 ? (
                <div className="empty-state">
                  <i className="fa-solid fa-book" />
                  <p>No courses created yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.courses.map((course) => (
                    <div
                      key={course.id}
                      style={{
                        padding: '12px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, background: '#EBF2FE', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px' }}>
                            {course.code}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>{course.title}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                          Join Code: <strong style={{ color: 'var(--text)' }}>{course.join_code}</strong> · {course.enrolledCount} students
                        </div>
                      </div>

                      <Link href={`/teacher/courses/${course.id}`} className="btn btn-outline btn-sm">
                        Edit
                      </Link>
                    </div>
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

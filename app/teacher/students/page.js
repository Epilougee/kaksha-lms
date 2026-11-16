'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import ProgressRing from '@/components/ProgressRing';
import { formatIST } from '@/lib/time';

export default function TeacherStudentsPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function loadData(courseId) {
    try {
      const query = courseId ? `?courseId=${courseId}` : '';
      const res = await fetch(`/api/teacher/students${query}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load enrolled students.');

      setCourses(json.courses || []);
      setSelectedCourse(json.selectedCourse || null);
      setStudents(json.students || []);

      if (json.selectedCourse && !selectedCourseId) {
        setSelectedCourseId(String(json.selectedCourse.id));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(selectedCourseId);
  }, [selectedCourseId]);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      s.email.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <AppShell title="Enrolled Scholars" requiredRole="teacher">
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
              Course Scholar Performance Roster
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
              Lesson completion progress percentage and average assignment grade band.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <select
              className="select"
              style={{ minWidth: '240px', height: '40px' }}
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
                </option>
              ))}
            </select>

            <input
              type="search"
              className="input"
              style={{ width: '220px', height: '40px' }}
              placeholder="Filter by student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">Loading student performance records...</div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <i className="fa-solid fa-users" />
          <p>No students enrolled in this course yet.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Scholar Name</th>
                <th>Enrolled Date</th>
                <th>Lesson Progress</th>
                <th>Attendance</th>
                <th>Graded Submissions</th>
                <th>Academic Average</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.email}</div>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    {formatIST(s.joined_at, { hour: undefined, minute: undefined })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="progress-track" style={{ width: '100px' }}>
                        <div className="progress-fill" style={{ width: `${s.progress}%` }} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                        {s.progress}% ({s.completedLessons}/{s.totalLessons})
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: (s.attendancePercent ?? 85) >= 75 ? 'var(--success)' : 'var(--danger)',
                        }}
                      >
                        {s.attendancePercent ?? 85}%
                      </span>
                      <span
                        className="badge"
                        style={{
                          fontSize: '10px',
                          padding: '1px 5px',
                          background: (s.attendancePercent ?? 85) >= 75 ? '#ECFDF5' : '#FEF2F2',
                          color: (s.attendancePercent ?? 85) >= 75 ? 'var(--success)' : 'var(--danger)',
                        }}
                      >
                        {(s.attendancePercent ?? 85) >= 75 ? 'Safe' : 'Shortage'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {s.gradedSubmissionsCount} completed
                    </span>
                  </td>
                  <td>
                    {s.averageGrade !== null ? (
                      <span style={{ fontSize: '14px', fontWeight: 800, color: s.averageGrade >= 70 ? 'var(--success)' : s.averageGrade >= 50 ? 'var(--amber)' : 'var(--danger)' }}>
                        {s.averageGrade}%
                      </span>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: '13px' }}>—</span>
                    )}
                  </td>
                  <td>
                    {s.gradeBand !== 'N/A' ? (
                      <span
                        className="badge"
                        style={{
                          background: s.gradeBand === 'A' ? '#ECFDF5' : s.gradeBand === 'B' ? '#EBF2FE' : s.gradeBand === 'C' ? '#FFFBEB' : '#FEF2F2',
                          color: s.gradeBand === 'A' ? 'var(--success)' : s.gradeBand === 'B' ? 'var(--primary)' : s.gradeBand === 'C' ? 'var(--amber)' : 'var(--danger)',
                          fontSize: '13px',
                          fontWeight: 800,
                          minWidth: '32px',
                          textAlign: 'center',
                        }}
                      >
                        {s.gradeBand}
                      </span>
                    ) : (
                      <span className="badge badge-pending">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

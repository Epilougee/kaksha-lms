'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import StatusBadge from '@/components/StatusBadge';
import { formatIST } from '@/lib/time';

export default function TeacherLivePage() {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  // Schedule modal state
  const [showModal, setShowModal] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [duration, setDuration] = useState('45');
  const [scheduling, setScheduling] = useState(false);

  async function loadSessions() {
    try {
      const res = await fetch('/api/teacher/live');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load live sessions.');

      setSessions(data.sessions || []);
      setCourses(data.courses || []);
      if (data.courses?.length > 0 && !courseId) {
        setCourseId(String(data.courses[0].id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function handleSchedule(e) {
    e.preventDefault();
    if (!courseId || !title || !startsAt) return;

    setScheduling(true);
    try {
      const res = await fetch('/api/teacher/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          title,
          starts_at: startsAt,
          duration_min: Number(duration),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule live class.');

      setShowModal(false);
      setTitle('');
      setStartsAt('');
      setToastMsg('Live class scheduled successfully!');
      setTimeout(() => setToastMsg(null), 3000);
      loadSessions();
    } catch (err) {
      alert(err.message);
    } finally {
      setScheduling(false);
    }
  }

  return (
    <AppShell title="Live Classes" requiredRole="teacher">
      {toastMsg && (
        <div className="toast toast-success">
          <i className="fa-solid fa-circle-check" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>Live Virtual Lectures</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
            Host interactive WebRTC class sessions powered by Jitsi Meet.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <i className="fa-solid fa-plus" />
          <span>Schedule Live Class</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading scheduled classes...</div>
      ) : sessions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <i className="fa-solid fa-video-slash" />
            <p>No live classes scheduled. Schedule your first interactive lecture.</p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: 12 }}
              onClick={() => setShowModal(true)}
            >
              <i className="fa-solid fa-plus" />
              <span>Schedule Class</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sessions.map((s) => (
            <div
              key={s.id}
              className="card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: s.isLiveNow ? '#ECFDF5' : '#EBF2FE',
                    color: s.isLiveNow ? 'var(--success)' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                  }}
                >
                  <i className={`fa-solid ${s.isLiveNow ? 'fa-broadcast-tower' : 'fa-video'}`} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: '#EBF2FE',
                        color: 'var(--primary)',
                      }}
                    >
                      {s.courseCode}
                    </span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{s.title}</h3>
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>
                      <i className="fa-regular fa-calendar" style={{ marginRight: 6 }} />
                      {formatIST(s.starts_at)}
                    </span>
                    <span>&middot;</span>
                    <span>
                      <i className="fa-regular fa-clock" style={{ marginRight: 6 }} />
                      {s.duration_min} minutes
                    </span>
                    <span>&middot;</span>
                    <span>Course: {s.courseTitle}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {s.isLiveNow ? (
                  <span className="badge badge-success">
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', marginRight: 4 }} />
                    Live Ready
                  </span>
                ) : s.isPast ? (
                  <span className="badge badge-muted">Concluded</span>
                ) : (
                  <span className="badge badge-info">Scheduled</span>
                )}

                <Link href={`/teacher/live/${s.id}`} className="btn btn-primary">
                  <i className="fa-solid fa-video" />
                  <span>Host Class</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Live Class Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Schedule Live Lecture</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--muted)' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Course</label>
                <select
                  className="select"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Lecture Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Live Lab: BCNF Decomposition"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date & Time (IST)</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input
                  type="number"
                  className="input"
                  min="15"
                  max="180"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={scheduling || !title || !startsAt}
                >
                  <span>{scheduling ? 'Scheduling...' : 'Schedule Lecture'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

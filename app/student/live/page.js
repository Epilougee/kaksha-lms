'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { formatIST } from '@/lib/time';

export default function StudentLiveListPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/student/live')
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load live sessions.');
        return json;
      })
      .then((json) => setSessions(json.sessions || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="Live Classes" requiredRole="student">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Virtual Classroom Schedule
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          Interactive video lecture sessions. Join button activates 10 minutes prior to scheduled start.
        </p>
      </div>

      {loading && <div className="card">Loading live classes...</div>}

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="card empty-state">
          <i className="fa-solid fa-video-slash" />
          <p>No live classes scheduled for your enrolled courses.</p>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sessions.map((session) => (
            <div
              key={session.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                padding: '20px 24px',
                borderLeft: session.canJoin ? '5px solid var(--danger)' : '1px solid var(--border)',
              }}
            >
              <div style={{ maxWidth: '680px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#EBF2FE', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px' }}>
                    {session.courseCode}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Instructor: <strong>{session.teacherName}</strong>
                  </span>
                  {session.canJoin && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '2px 8px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DC2626' }} />
                      LIVE NOW
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)' }}>
                  {session.title}
                </h2>

                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                  <i className="fa-regular fa-clock" style={{ marginRight: '6px' }} />
                  {formatIST(session.starts_at)} ({session.duration_min} minutes)
                </div>
              </div>

              <div>
                {session.canJoin ? (
                  <Link href={`/student/live/${session.id}`} className="btn btn-primary" style={{ background: '#DC2626' }}>
                    <i className="fa-solid fa-video" />
                    <span>Join Class</span>
                  </Link>
                ) : session.isPast ? (
                  <span className="badge badge-pending">Concluded</span>
                ) : (
                  <div style={{ textAlign: 'right' }}>
                    <button type="button" className="btn btn-outline" disabled title="Join activates 10 minutes before class">
                      <i className="fa-solid fa-lock" />
                      <span>Join Class</span>
                    </button>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                      Opens 10m before start
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

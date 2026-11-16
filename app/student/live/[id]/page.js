'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { formatIST } from '@/lib/time';

export default function StudentLiveRoomPage() {
  const params = useParams();
  const sessionId = params.id;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/student/live/${sessionId}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load classroom.');
        return json;
      })
      .then((json) => setSession(json.session))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <AppShell title="Live Virtual Classroom" requiredRole="student">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/student/live" className="btn btn-outline btn-sm">
            <i className="fa-solid fa-arrow-left" />
            <span>Leave Room</span>
          </Link>
          {session && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {session.courseCode} · Live Session
              </div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                {session.title}
              </h1>
            </div>
          )}
        </div>

        {session && (
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Instructor: <strong>{session.teacherName}</strong> · Scheduled: {formatIST(session.starts_at)}
          </div>
        )}
      </div>

      {loading && <div className="card">Connecting to collegiate video network...</div>}

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {!loading && session && (
        <div>
          {session.canJoin ? (
            /* Jitsi Meet iframe embed per requirements: meet.jit.si with room name and allow="camera; microphone; fullscreen" */
            <div className="jitsi-frame-wrap">
              <iframe
                src={`https://meet.jit.si/${session.roomName}#userInfo.displayName="${encodeURIComponent(session.userName)}"`}
                title={session.title}
                allow="camera; microphone; fullscreen; display-capture"
              />
            </div>
          ) : (
            <div className="card empty-state" style={{ padding: '60px 24px' }}>
              <i className="fa-solid fa-lock" />
              <h2>Classroom Locked</h2>
              <p>
                This virtual session starts at {formatIST(session.starts_at)}. The door unlocks 10 minutes prior to start time.
              </p>
              <Link href="/student/live" className="btn btn-outline">
                Back to Schedule
              </Link>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

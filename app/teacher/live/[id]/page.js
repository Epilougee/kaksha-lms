'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { formatIST } from '@/lib/time';

export default function TeacherLiveClassroomPage() {
  const params = useParams();
  const sessionId = params.id;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRoom() {
      try {
        const res = await fetch(`/api/teacher/live/${sessionId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load classroom.');

        setSession(data.session);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadRoom();
  }, [sessionId]);

  const jitsiUrl = session
    ? `https://meet.jit.si/${session.roomName}#userInfo.displayName="${encodeURIComponent(
        session.teacherName || 'Faculty'
      )}"`
    : '';

  return (
    <AppShell title="Live Classroom" requiredRole="teacher">
      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Initializing WebRTC virtual classroom...</div>
      ) : !session ? (
        <div className="card">
          <div className="empty-state">
            <i className="fa-solid fa-video-slash" />
            <p>Live session not found.</p>
            <Link href="/teacher/live" className="btn btn-primary" style={{ marginTop: 12 }}>
              Back to Live Classes
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Top Classroom Bar */}
          <div
            className="card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-success">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', marginRight: 4 }} />
                  Broadcasting as Host
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: 'var(--primary)' }}>
                  {session.courseCode}
                </span>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
                  {session.title}
                </h2>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                {session.courseTitle} &middot; Scheduled at {formatIST(session.starts_at)} ({session.duration_min} min)
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/teacher/live" className="btn btn-outline btn-sm">
                <i className="fa-solid fa-arrow-left" />
                <span>Exit Classroom</span>
              </Link>
            </div>
          </div>

          {/* Jitsi Meet Video Iframe */}
          <div
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              height: 'calc(100vh - 230px)',
              minHeight: 520,
              background: '#0F172A',
            }}
          >
            <iframe
              src={jitsiUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              title={session.title}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}

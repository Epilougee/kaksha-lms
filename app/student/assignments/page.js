'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import StatusBadge from '@/components/StatusBadge';
import { formatIST } from '@/lib/time';

export default function StudentAssignmentsListPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, submitted, graded

  useEffect(() => {
    fetch('/api/student/assignments')
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load assignments.');
        return json;
      })
      .then((json) => setAssignments(json.assignments || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = assignments.filter((a) => {
    if (filter === 'pending') return a.status === 'Pending' || a.status === 'Overdue';
    if (filter === 'submitted') return a.status === 'Submitted';
    if (filter === 'graded') return a.status === 'Graded';
    return true;
  });

  return (
    <AppShell title="Assignments" requiredRole="student">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Course Work & Deliverables
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Submit responses, check deadlines, and inspect faculty evaluation marks.
          </p>
        </div>

        <div className="tabs" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({assignments.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            To Do
          </button>
          <button
            type="button"
            className={`tab-btn ${filter === 'graded' ? 'active' : ''}`}
            onClick={() => setFilter('graded')}
          >
            Graded
          </button>
        </div>
      </div>

      {loading && <div className="card">Loading assignments...</div>}

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card empty-state">
          <i className="fa-solid fa-file-circle-check" />
          <p>No assignments found in this category.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((asg) => (
            <Link
              key={asg.id}
              href={`/student/assignments/${asg.id}`}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                gap: '16px',
                flexWrap: 'wrap',
                transition: 'all 160ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ maxWidth: '700px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#EBF2FE', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px' }}>
                    {asg.courseCode}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {asg.courseTitle}
                  </span>
                </div>

                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                  {asg.title}
                </h2>

                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                  <i className="fa-regular fa-clock" style={{ marginRight: '6px' }} />
                  Due: <strong>{formatIST(asg.due_at)}</strong> &middot; Max Marks: {asg.max_marks}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {asg.submission?.marks !== null && asg.submission?.marks !== undefined && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)' }}>
                      {asg.submission.marks} / {asg.max_marks}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                      Score ({asg.submission.gradePercent}%)
                    </div>
                  </div>
                )}

                <StatusBadge status={asg.status} isLate={asg.isLate} />

                <i className="fa-solid fa-chevron-right" style={{ color: 'var(--muted)', fontSize: '13px' }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

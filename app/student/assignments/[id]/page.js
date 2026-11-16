'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import StatusBadge from '@/components/StatusBadge';
import { formatIST } from '@/lib/time';

export default function StudentAssignmentDetailPage() {
  const params = useParams();
  const asgId = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Submission Form State
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  async function loadAssignment() {
    try {
      const res = await fetch(`/api/student/assignments/${asgId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load assignment.');
      setData(json);
      if (json.submission?.text_answer) {
        setTextAnswer(json.submission.text_answer);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignment();
  }, [asgId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setToastMsg(null);

    try {
      let uploadedFilePath = data?.submission?.file_path || null;

      // Direct-to-storage upload bypassing Vercel body limits
      if (selectedFile) {
        // 1. Get signed upload URL from server
        const authRes = await fetch('/api/storage/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: selectedFile.name, folder: 'submissions' }),
        });
        const authData = await authRes.json();
        if (!authRes.ok) throw new Error(authData.error || 'Upload authorization failed.');

        // 2. Direct browser upload to Supabase storage signed URL
        const uploadRes = await fetch(authData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': selectedFile.type || 'application/octet-stream' },
          body: selectedFile,
        });

        if (!uploadRes.ok) throw new Error('File upload to storage failed.');
        uploadedFilePath = authData.filePath;
      }

      // 3. Save submission record
      const subRes = await fetch(`/api/student/assignments/${asgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text_answer: textAnswer,
          file_path: uploadedFilePath,
        }),
      });
      const subData = await subRes.json();
      if (!subRes.ok) throw new Error(subData.error || 'Failed to record submission.');

      setToastMsg('Assignment submitted successfully.');
      setSelectedFile(null);
      await loadAssignment();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Assignment" requiredRole="student">
        <div className="card">Loading assignment details...</div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell title="Assignment" requiredRole="student">
        <div className="alert alert-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error || 'Assignment not found.'}</span>
        </div>
        <Link href="/student/assignments" className="btn btn-outline btn-sm">
          Back to Assignments
        </Link>
      </AppShell>
    );
  }

  const { assignment, submission } = data;

  return (
    <AppShell title="Assignment Details" requiredRole="student">
      <div style={{ marginBottom: '16px' }}>
        <Link href="/student/assignments" className="btn btn-outline btn-sm">
          <i className="fa-solid fa-arrow-left" />
          <span>All Assignments</span>
        </Link>
      </div>

      {toastMsg && (
        <div className="alert alert-success">
          <i className="fa-solid fa-circle-check" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Instructions & Submission Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, background: '#EBF2FE', color: 'var(--primary)', padding: '3px 8px', borderRadius: '4px' }}>
                  {assignment.courseCode} · {assignment.courseTitle}
                </span>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginTop: '8px' }}>
                  {assignment.title}
                </h1>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                  Instructor: <strong>{assignment.teacherName}</strong>
                </div>
              </div>

              <StatusBadge status={assignment.status} isLate={assignment.isLate} />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: '8px' }}>
                Instructions
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {assignment.instructions || 'No specific instructions provided.'}
              </div>
            </div>
          </div>

          {/* Submission Form (Locked if overdue and already submitted) */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '12px' }}>
              {submission ? 'Your Submission' : 'Submit Response'}
            </h2>

            {assignment.isLocked ? (
              <div className="alert alert-error">
                <i className="fa-solid fa-lock" />
                <span>Submissions for this assignment are locked as the deadline has passed.</span>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
                {submission ? 'You can resubmit until the deadline passes.' : 'Submit a file attachment (PDF, DOCX, PPTX, PNG, ZIP max 20MB) and/or text answer.'}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="textAnswer">Written Answer / Solution Notes</label>
                <textarea
                  id="textAnswer"
                  className="textarea"
                  placeholder="Paste your code explanation or written response here..."
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  disabled={assignment.isLocked}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="fileUpload">File Attachment</label>
                {!assignment.isLocked && (
                  <input
                    id="fileUpload"
                    type="file"
                    className="input"
                    accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg,.zip"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  />
                )}

                {submission?.file_path && (
                  <div style={{ marginTop: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-regular fa-file" style={{ color: 'var(--primary)' }} />
                    <span style={{ color: 'var(--muted)' }}>Uploaded file: {submission.file_path.split('/').pop()}</span>
                    {submission.fileDownloadUrl && (
                      <a href={submission.fileDownloadUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Download
                      </a>
                    )}
                  </div>
                )}
              </div>

              {!assignment.isLocked && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || (!textAnswer && !selectedFile && !submission?.file_path)}
                >
                  <i className="fa-solid fa-paper-plane" />
                  <span>{submitting ? 'Uploading directly to storage...' : submission ? 'Update Submission' : 'Submit Assignment'}</span>
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Status & Faculty Evaluation Feedback */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '16px' }}>
              Submission Info
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <span className="muted" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Deadline</span>
                <strong style={{ color: 'var(--text)' }}>{formatIST(assignment.due_at)}</strong>
              </div>

              <div>
                <span className="muted" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Max Allocation</span>
                <strong style={{ color: 'var(--text)' }}>{assignment.max_marks} Marks</strong>
              </div>

              {submission && (
                <div>
                  <span className="muted" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Submitted At</span>
                  <strong style={{ color: 'var(--text)' }}>{formatIST(submission.submitted_at)}</strong>
                  {assignment.isLate && <span className="badge badge-late" style={{ marginLeft: '6px' }}>Late</span>}
                </div>
              )}
            </div>
          </div>

          {/* Evaluation Card (if graded) */}
          {submission?.graded_at && (
            <div className="card" style={{ borderLeft: '5px solid var(--success)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 className="card-title" style={{ margin: 0 }}>Faculty Evaluation</h2>
                <span className="badge badge-graded">Official</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--success)' }}>
                  {submission.marks}
                </span>
                <span style={{ fontSize: '16px', color: 'var(--muted)', fontWeight: 600 }}>
                  / {assignment.max_marks}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>
                  Grade: {submission.gradePercent}%
                </span>
              </div>

              {submission.feedback && (
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    Instructor Feedback
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>
                    {submission.feedback}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

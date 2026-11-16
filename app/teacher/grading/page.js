'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { formatIST } from '@/lib/time';

function TeacherGradingContent() {
  const searchParams = useSearchParams();
  const initialAsgId = searchParams.get('assignmentId');

  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAsgId, setSelectedAsgId] = useState(initialAsgId || '');
  const [selectedAsg, setSelectedAsg] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [activeSub, setActiveSub] = useState(null);

  const [marksInput, setMarksInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  async function loadData(asgId) {
    try {
      const query = asgId ? `?assignmentId=${asgId}` : '';
      const res = await fetch(`/api/teacher/grading${query}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load grading data.');

      setCourses(json.courses || []);
      setAssignments(json.assignments || []);
      setSelectedAsg(json.selectedAssignment || null);
      setSubmissions(json.submissions || []);

      if (json.selectedAssignment && !selectedAsgId) {
        setSelectedAsgId(String(json.selectedAssignment.id));
      }

      // Pick first submission or preserve active
      if (json.submissions?.length > 0) {
        const found = json.submissions.find((s) => s.id === activeSub?.id);
        const target = found || json.submissions[0];
        setActiveSub(target);
        setMarksInput(target.marks !== null && target.marks !== undefined ? String(target.marks) : '');
        setFeedbackInput(target.feedback || '');
      } else {
        setActiveSub(null);
        setMarksInput('');
        setFeedbackInput('');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(selectedAsgId);
  }, [selectedAsgId]);

  function handleSelectSubmission(sub) {
    setActiveSub(sub);
    setMarksInput(sub.marks !== null && sub.marks !== undefined ? String(sub.marks) : '');
    setFeedbackInput(sub.feedback || '');
    setToastMsg(null);
  }

  async function handleGradeSubmit(e) {
    e.preventDefault();
    if (!activeSub) return;
    setSavingGrade(true);
    setToastMsg(null);

    try {
      const res = await fetch('/api/teacher/grading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: activeSub.id,
          marks: Number(marksInput),
          feedback: feedbackInput,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to record grade.');

      setToastMsg('Grade recorded successfully.');
      await loadData(selectedAsgId);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingGrade(false);
    }
  }

  return (
    <AppShell title="Grading & Evaluation Console" requiredRole="teacher">
      {/* Top Filter Bar: Pick Assignment */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
              Select Assignment
            </span>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
              {selectedAsg?.title || 'No assignments'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              className="select"
              style={{ minWidth: '280px', height: '40px' }}
              value={selectedAsgId}
              onChange={(e) => setSelectedAsgId(e.target.value)}
            >
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.max_marks} marks)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="alert alert-success">
          <i className="fa-solid fa-circle-check" />
          <span>{toastMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="card">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="card empty-state">
          <i className="fa-solid fa-inbox" />
          <p>No student submissions received for this assignment yet.</p>
        </div>
      ) : (
        /* Split view: submissions list / details on left, grading & feedback form on right */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Submissions Roster */}
          <div className="card" style={{ padding: '16px' }}>
            <h2 className="card-title" style={{ fontSize: '15px', marginBottom: '12px' }}>
              Submissions ({submissions.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {submissions.map((sub) => {
                const isSelected = activeSub?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSubmission(sub)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? '#EBF2FE' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>
                        {sub.studentName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {formatIST(sub.submitted_at)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {sub.isLate && (
                        <span className="badge badge-late" style={{ fontSize: '10px', padding: '2px 6px', display: 'block', marginBottom: '2px' }}>
                          Late
                        </span>
                      )}
                      {sub.marks !== null && sub.marks !== undefined ? (
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--success)' }}>
                          {sub.marks}/{selectedAsg?.max_marks}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: 600 }}>
                          Ungraded
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Column: Selected Submission Content */}
          <div className="card">
            <h2 className="card-title" style={{ fontSize: '16px', marginBottom: '16px' }}>
              Submission Content
            </h2>

            {activeSub ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Student Scholar
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>
                    {activeSub.studentName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {activeSub.studentEmail} &middot; Submitted: {formatIST(activeSub.submitted_at)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Written Response
                  </div>
                  <div style={{ padding: '14px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '8px', minHeight: '120px', whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: 1.6 }}>
                    {activeSub.text_answer || 'No written text submitted.'}
                  </div>
                </div>

                {activeSub.file_path && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      File Deliverable
                    </div>
                    <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <i className="fa-regular fa-file-lines" style={{ color: 'var(--primary)' }} />
                        <span style={{ fontWeight: 600 }}>{activeSub.file_path.split('/').pop()}</span>
                      </div>
                      {activeSub.fileDownloadUrl && (
                        <a href={activeSub.fileDownloadUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                          <i className="fa-solid fa-arrow-down-to-bracket" />
                          <span>Download</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="muted">Select a submission from the left list.</p>
            )}
          </div>

          {/* Right Column: Marks & Feedback Form */}
          <div className="card">
            <h2 className="card-title" style={{ fontSize: '16px', marginBottom: '16px' }}>
              Evaluation & Marks
            </h2>

            {activeSub ? (
              <form onSubmit={handleGradeSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="gradeMarks">
                    Marks Awarded (Max: {selectedAsg?.max_marks})
                  </label>
                  <input
                    id="gradeMarks"
                    type="number"
                    step="0.5"
                    min="0"
                    max={selectedAsg?.max_marks || 100}
                    className="input"
                    placeholder={`0 - ${selectedAsg?.max_marks}`}
                    value={marksInput}
                    onChange={(e) => setMarksInput(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="gradeFeedback">
                    Feedback & Evaluation Notes
                  </label>
                  <textarea
                    id="gradeFeedback"
                    className="textarea"
                    placeholder="Provide constructive feedback for student improvement..."
                    rows={4}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '8px' }}
                  disabled={savingGrade || !marksInput}
                >
                  <i className="fa-solid fa-check" />
                  <span>{savingGrade ? 'Recording...' : 'Record Grade'}</span>
                </button>
              </form>
            ) : (
              <p className="muted">Select a submission to evaluate.</p>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function TeacherGradingPage() {
  return (
    <Suspense fallback={<div className="loading-state">Loading grading desk...</div>}>
      <TeacherGradingContent />
    </Suspense>
  );
}

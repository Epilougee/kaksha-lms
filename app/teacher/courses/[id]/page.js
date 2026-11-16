'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';

export default function TeacherCourseEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Lesson modal state
  const [lessonModal, setLessonModal] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState('video');
  const [lessonUrl, setLessonUrl] = useState('');
  const [lessonOrder, setLessonOrder] = useState('1');
  const [selectedFile, setSelectedFile] = useState(null);
  const [savingLesson, setSavingLesson] = useState(false);

  // Live session modal state
  const [sessionModal, setSessionModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionDuration, setSessionDuration] = useState('45');
  const [savingSession, setSavingSession] = useState(false);

  // Assignment modal state
  const [asgModal, setAsgModal] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgInstructions, setAsgInstructions] = useState('');
  const [asgDue, setAsgDue] = useState('');
  const [asgMaxMarks, setAsgMaxMarks] = useState('100');
  const [savingAsg, setSavingAsg] = useState(false);

  async function loadCourse() {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load course details.');
      setCourse(json.course);
      setLessons(json.lessons || []);
      setSessions(json.sessions || []);
      setAssignments(json.assignments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  function copyJoinCode() {
    if (course?.join_code) {
      navigator.clipboard.writeText(course.join_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleAddLesson(e) {
    e.preventDefault();
    setSavingLesson(true);
    try {
      let uploadedFilePath = null;
      if (lessonType === 'material' && selectedFile) {
        // Direct-to-storage upload
        const authRes = await fetch('/api/storage/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: selectedFile.name, folder: 'materials' }),
        });
        const authData = await authRes.json();
        if (!authRes.ok) throw new Error(authData.error || 'Upload failed.');

        await fetch(authData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': selectedFile.type || 'application/octet-stream' },
          body: selectedFile,
        });
        uploadedFilePath = authData.filePath;
      }

      const res = await fetch(`/api/teacher/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lessonTitle,
          type: lessonType,
          url: lessonUrl || null,
          file_path: uploadedFilePath,
          order_no: Number(lessonOrder) || lessons.length + 1,
        }),
      });
      if (!res.ok) throw new Error('Failed to create lesson.');
      setLessonModal(false);
      setLessonTitle('');
      setLessonUrl('');
      setSelectedFile(null);
      await loadCourse();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingLesson(false);
    }
  }

  async function handleDeleteLesson(id) {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      const res = await fetch(`/api/teacher/lessons/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete.');
      await loadCourse();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleAddSession(e) {
    e.preventDefault();
    setSavingSession(true);
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sessionTitle,
          starts_at: sessionDate,
          duration_min: Number(sessionDuration),
        }),
      });
      if (!res.ok) throw new Error('Failed to schedule session.');
      setSessionModal(false);
      setSessionTitle('');
      setSessionDate('');
      await loadCourse();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingSession(false);
    }
  }

  async function handleDeleteSession(id) {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await fetch(`/api/teacher/sessions/${id}`, { method: 'DELETE' });
      await loadCourse();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleAddAssignment(e) {
    e.preventDefault();
    setSavingAsg(true);
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: asgTitle,
          instructions: asgInstructions,
          due_at: asgDue,
          max_marks: Number(asgMaxMarks),
        }),
      });
      if (!res.ok) throw new Error('Failed to create assignment.');
      setAsgModal(false);
      setAsgTitle('');
      setAsgInstructions('');
      setAsgDue('');
      await loadCourse();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingAsg(false);
    }
  }

  async function handleDeleteAssignment(id) {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await fetch(`/api/teacher/assignments/${id}`, { method: 'DELETE' });
      await loadCourse();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <AppShell title="Course Editor" requiredRole="teacher"><div className="card">Loading...</div></AppShell>;
  if (error || !course) return <AppShell title="Course Editor" requiredRole="teacher"><div className="alert alert-error">{error || 'Course not found.'}</div></AppShell>;

  return (
    <AppShell title={`Edit: ${course.title}`} requiredRole="teacher">
      <div style={{ marginBottom: '16px' }}>
        <Link href="/teacher" className="btn btn-outline btn-sm">
          <i className="fa-solid fa-arrow-left" />
          <span>Back to Console</span>
        </Link>
      </div>

      {/* Course Info & Join Code Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, background: '#EBF2FE', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px' }}>
                {course.code}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, background: (course.price || 0) > 0 ? '#FEF3C7' : '#F1F5F9', color: (course.price || 0) > 0 ? '#92400E' : '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                {(course.price || 0) > 0 ? `Elective Fee: ₹${course.price}` : 'Institutional Curriculum (Free)'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                {course.enrolledCount} students enrolled
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginTop: '6px' }}>
              {course.title}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px', maxWidth: '700px' }}>
              {course.description || 'No description provided.'}
            </p>
          </div>

          {/* Join Code Box with One-Click Copy */}
          <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', padding: '12px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', fontWeight: 700 }}>
                Course Join Code
              </span>
              <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--primary)' }}>
                {course.join_code}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={copyJoinCode}
            >
              <i className={copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'} />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main Management Columns: Lessons, Live Sessions, Assignments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {/* 1. Lessons Management */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Lessons ({lessons.length})</h2>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setLessonOrder(String(lessons.length + 1));
                setLessonModal(true);
              }}
            >
              <i className="fa-solid fa-plus" />
              <span>Add</span>
            </button>
          </div>

          {lessons.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-film" />
              <p>No lessons added yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lessons.map((l) => (
                <div
                  key={l.id}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.order_no}. {l.title}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'capitalize' }}>
                      {l.type}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteLesson(l.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                    title="Delete lesson"
                  >
                    <i className="fa-regular fa-trash-can" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Live Sessions Management */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Live Sessions ({sessions.length})</h2>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setSessionModal(true)}
            >
              <i className="fa-solid fa-plus" />
              <span>Schedule</span>
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-video" />
              <p>No live classes scheduled.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sessions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {s.duration_min}m
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSession(s.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                    title="Delete session"
                  >
                    <i className="fa-regular fa-trash-can" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Assignments Management */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Assignments ({assignments.length})</h2>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setAsgModal(true)}
            >
              <i className="fa-solid fa-plus" />
              <span>Create</span>
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-file-pen" />
              <p>No assignments posted.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {assignments.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {a.max_marks} marks
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteAssignment(a.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                    title="Delete assignment"
                  >
                    <i className="fa-regular fa-trash-can" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Lesson Modal */}
      {lessonModal && (
        <div className="modal-overlay" onClick={() => setLessonModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Add Lesson</h2>
            <form onSubmit={handleAddLesson}>
              <div className="form-group">
                <label className="form-label" htmlFor="lTitle">Lesson Title</label>
                <input
                  id="lTitle"
                  type="text"
                  className="input"
                  placeholder="e.g. Lecture 5: Tree Traversals"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="lType">Type</label>
                <select
                  id="lType"
                  className="select"
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value)}
                >
                  <option value="video">Video Lecture (YouTube)</option>
                  <option value="material">Study Material (Link or File)</option>
                </select>
              </div>

              {lessonType === 'video' ? (
                <div className="form-group">
                  <label className="form-label" htmlFor="lUrl">YouTube Video URL</label>
                  <input
                    id="lUrl"
                    type="url"
                    className="input"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={lessonUrl}
                    onChange={(e) => setLessonUrl(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="lDocUrl">Documentation / External Link (Optional)</label>
                    <input
                      id="lDocUrl"
                      type="url"
                      className="input"
                      placeholder="https://docs.python.org/..."
                      value={lessonUrl}
                      onChange={(e) => setLessonUrl(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="lFile">Or Upload File (PDF, DOCX, PPTX max 20MB)</label>
                    <input
                      id="lFile"
                      type="file"
                      className="input"
                      accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg,.zip"
                      onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="lOrder">Order Number</label>
                <input
                  id="lOrder"
                  type="number"
                  min="1"
                  className="input"
                  value={lessonOrder}
                  onChange={(e) => setLessonOrder(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setLessonModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingLesson}>
                  {savingLesson ? 'Saving...' : 'Add Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Live Session Modal */}
      {sessionModal && (
        <div className="modal-overlay" onClick={() => setSessionModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Schedule Live Virtual Class</h2>
            <form onSubmit={handleAddSession}>
              <div className="form-group">
                <label className="form-label" htmlFor="sTitle">Session Title</label>
                <input
                  id="sTitle"
                  type="text"
                  className="input"
                  placeholder="e.g. Doubt Clearing & Live Q&A"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sDate">Date & Time (IST)</label>
                <input
                  id="sDate"
                  type="datetime-local"
                  className="input"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sDur">Duration (Minutes)</label>
                <input
                  id="sDur"
                  type="number"
                  min="15"
                  max="180"
                  className="input"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setSessionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingSession}>
                  {savingSession ? 'Scheduling...' : 'Schedule Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {asgModal && (
        <div className="modal-overlay" onClick={() => setAsgModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Create Assignment</h2>
            <form onSubmit={handleAddAssignment}>
              <div className="form-group">
                <label className="form-label" htmlFor="aTitle">Title</label>
                <input
                  id="aTitle"
                  type="text"
                  className="input"
                  placeholder="e.g. Assignment 3: Relational Algebra"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="aInst">Instructions</label>
                <textarea
                  id="aInst"
                  className="textarea"
                  placeholder="Provide instructions, problem descriptions, or criteria..."
                  value={asgInstructions}
                  onChange={(e) => setAsgInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="aDue">Due Date & Time (IST)</label>
                <input
                  id="aDue"
                  type="datetime-local"
                  className="input"
                  value={asgDue}
                  onChange={(e) => setAsgDue(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="aMax">Max Marks</label>
                <input
                  id="aMax"
                  type="number"
                  min="1"
                  max="1000"
                  className="input"
                  value={asgMaxMarks}
                  onChange={(e) => setAsgMaxMarks(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setAsgModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingAsg}>
                  {savingAsg ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

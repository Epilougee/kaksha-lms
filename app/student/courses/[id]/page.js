'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import StatusBadge from '@/components/StatusBadge';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import { formatIST } from '@/lib/time';

function StudentCourseDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.id;
  const initialLessonId = searchParams.get('lesson');

  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons'); // lessons, materials, assignments
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState(false);

  async function loadCourse() {
    try {
      const res = await fetch(`/api/student/courses/${courseId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load course details.');
      setData(json);

      // Select active video/material lesson
      const lessons = json.lessons || [];
      if (lessons.length > 0) {
        if (initialLessonId) {
          const match = lessons.find((l) => String(l.id) === String(initialLessonId));
          setActiveLesson(match || lessons[0]);
        } else {
          // Default to first incomplete lesson or first lesson
          const firstIncomplete = lessons.find((l) => !l.isCompleted);
          setActiveLesson(firstIncomplete || lessons[0]);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  async function handleToggleComplete(lesson) {
    setToggling(true);
    try {
      const newStatus = !lesson.isCompleted;
      const res = await fetch(`/api/student/lessons/${lesson.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update progress.');
      await loadCourse();
    } catch (err) {
      alert(err.message);
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Course" requiredRole="student">
        <div className="card">Loading course material...</div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell title="Course" requiredRole="student">
        <div className="alert alert-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error || 'Course not found.'}</span>
        </div>
        <Link href="/student/courses" className="btn btn-outline btn-sm">
          Back to My Courses
        </Link>
      </AppShell>
    );
  }

  const { course, lessons, assignments } = data;
  const videoLessons = lessons.filter((l) => l.type === 'video');
  const materialLessons = lessons.filter((l) => l.type === 'material');

  const youtubeEmbed = activeLesson?.type === 'video' ? getYouTubeEmbedUrl(activeLesson.url) : null;

  return (
    <AppShell title={course.title} requiredRole="student">
      {/* Breadcrumb Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <Link href="/student/courses" style={{ color: 'var(--muted)', fontWeight: 500 }}>
            My Courses
          </Link>
          <span style={{ color: 'var(--muted)' }}>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>
            {course.code} ({course.title})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Course Progress</span>
          <div className="progress-track" style={{ width: '120px' }}>
            <div className="progress-fill" style={{ width: `${course.progress}%` }} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>
            {course.progress}%
          </span>
        </div>
      </div>

      {/* Main Asymmetric Workspace Layout: Video Player / Material Stage + Lesson Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Player / Reading Stage */}
        <div>
          {activeLesson ? (
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {activeLesson.type === 'video' ? (
                <div>
                  <div className="video-frame-wrap">
                    {youtubeEmbed ? (
                      <iframe
                        src={youtubeEmbed}
                        title={activeLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
                        Video link unavailable
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                        Lecture {activeLesson.order_no}
                      </div>
                      <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                        {activeLesson.title}
                      </h2>
                    </div>

                    <button
                      type="button"
                      className={`btn ${activeLesson.isCompleted ? 'btn-outline' : 'btn-primary'}`}
                      disabled={toggling}
                      onClick={() => handleToggleComplete(activeLesson)}
                    >
                      <i className={`fa-solid ${activeLesson.isCompleted ? 'fa-circle-check' : 'fa-check'}`} />
                      <span>{activeLesson.isCompleted ? 'Completed' : 'Mark Complete'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Material Reading View */
                <div style={{ padding: '32px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    Study Material {activeLesson.order_no}
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>
                    {activeLesson.title}
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px' }}>
                    Official collegiate documentation and reading resource for this module.
                  </p>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {activeLesson.downloadUrl && (
                      <a
                        href={activeLesson.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square" />
                        <span>Open Document</span>
                      </a>
                    )}
                    <button
                      type="button"
                      className={`btn ${activeLesson.isCompleted ? 'btn-outline' : 'btn-primary'}`}
                      disabled={toggling}
                      onClick={() => handleToggleComplete(activeLesson)}
                    >
                      <i className={`fa-solid ${activeLesson.isCompleted ? 'fa-circle-check' : 'fa-check'}`} />
                      <span>{activeLesson.isCompleted ? 'Completed' : 'Mark Complete'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card empty-state">
              <i className="fa-solid fa-film" />
              <p>No lessons uploaded for this course yet.</p>
            </div>
          )}
        </div>

        {/* Right Column: Course Navigation Drawer (Tabs: Lessons, Materials, Assignments) */}
        <div className="card" style={{ padding: '20px' }}>
          <div className="tabs" style={{ marginBottom: '16px' }}>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`}
              onClick={() => setActiveTab('lessons')}
            >
              Lessons ({videoLessons.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
              onClick={() => setActiveTab('materials')}
            >
              Materials ({materialLessons.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignments')}
            >
              Assignments ({assignments.length})
            </button>
          </div>

          {/* Tab 1: Video Lessons List */}
          {activeTab === 'lessons' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {videoLessons.map((lesson) => {
                const isCurrent = activeLesson?.id === lesson.id;
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isCurrent ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      background: isCurrent ? '#EBF2FE' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <i
                        className={lesson.isCompleted ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'}
                        style={{ color: lesson.isCompleted ? 'var(--success)' : 'var(--muted)', fontSize: '16px' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: isCurrent ? 700 : 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lesson.order_no}. {lesson.title}
                      </span>
                    </div>

                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Video</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Materials List */}
          {activeTab === 'materials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {materialLessons.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
                  No materials posted yet.
                </p>
              ) : (
                materialLessons.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setActiveLesson(m)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: activeLesson?.id === m.id ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      background: activeLesson?.id === m.id ? '#EBF2FE' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <i
                        className={m.isCompleted ? 'fa-solid fa-circle-check' : 'fa-regular fa-file-lines'}
                        style={{ color: m.isCompleted ? 'var(--success)' : 'var(--amber)', fontSize: '16px' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.title}
                      </span>
                    </div>

                    {m.downloadUrl && (
                      <a
                        href={m.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: 'var(--primary)', fontSize: '13px' }}
                        title="Download / Open"
                      >
                        <i className="fa-solid fa-arrow-down-to-bracket" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Assignments List */}
          {activeTab === 'assignments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {assignments.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
                  No assignments posted yet.
                </p>
              ) : (
                assignments.map((asg) => (
                  <Link
                    key={asg.id}
                    href={`/student/assignments/${asg.id}`}
                    style={{
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'background-color 160ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text)' }}>{asg.title}</strong>
                      <StatusBadge status={asg.status} isLate={asg.isLate} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)' }}>
                      <span>Due {formatIST(asg.due_at)}</span>
                      <span>{asg.max_marks} marks</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function StudentCourseDetailPage() {
  return (
    <Suspense fallback={<AppShell title="Course" requiredRole="student"><div className="card">Loading...</div></AppShell>}>
      <StudentCourseDetailContent />
    </Suspense>
  );
}

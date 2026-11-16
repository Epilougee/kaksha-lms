'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/AppShell';

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [colorIndex, setColorIndex] = useState('0');
  const [joinCode, setJoinCode] = useState('');
  const [price, setPrice] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/teacher/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          code,
          description,
          color_index: Number(colorIndex),
          price: Number(price) || 0,
          join_code: joinCode || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create course.');

      router.push(`/teacher/courses/${json.course.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <AppShell title="Create Course" requiredRole="teacher">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ marginBottom: '16px' }}>
          <Link href="/teacher" className="btn btn-outline btn-sm">
            <i className="fa-solid fa-arrow-left" />
            <span>Cancel</span>
          </Link>
        </div>

        <div className="card">
          <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>New Instructional Course</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>
            Set up course taxonomy, department code, and student enrollment access code.
          </p>

          {error && (
            <div className="alert alert-error">
              <i className="fa-solid fa-circle-exclamation" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Course Title</label>
              <input
                id="title"
                type="text"
                className="input"
                placeholder="e.g. Operating Systems & System Programming"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="code">Course Code</label>
              <input
                id="code"
                type="text"
                className="input"
                placeholder="e.g. OS-302"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="desc">Course Overview / Description</label>
              <textarea
                id="desc"
                className="textarea"
                placeholder="Brief summary of syllabus and objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="coverColor">Cover Palette Tone</label>
              <select
                id="coverColor"
                className="select"
                value={colorIndex}
                onChange={(e) => setColorIndex(e.target.value)}
              >
                <option value="0">Blue (#2F6FED)</option>
                <option value="1">Teal (#0D9488)</option>
                <option value="2">Coral (#E05344)</option>
                <option value="3">Amber (#D97706)</option>
                <option value="4">Green (#16A34A)</option>
                <option value="5">Slate (#475569)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="price">Course Fee / Price (₹)</label>
              <input
                id="price"
                type="number"
                min="0"
                step="50"
                className="input"
                placeholder="0 for institutional/free, or e.g. 499 for elective"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                Set ₹0 for mandatory college curriculum, or specify an elective enrollment fee (e.g., ₹499).
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="jCode">Custom Join Code (Optional)</label>
              <input
                id="jCode"
                type="text"
                className="input"
                placeholder="Leave blank to auto-generate (e.g. OS302)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <Link href="/teacher" className="btn btn-outline">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

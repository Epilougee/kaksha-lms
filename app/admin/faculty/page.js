'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Add Faculty Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo123');
  const [department, setDepartment] = useState('Computer Applications');
  const [saving, setSaving] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [formError, setFormError] = useState('');

  async function loadFaculty() {
    try {
      const res = await fetch('/api/admin/users?role=teacher');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch faculty directory');
      setFaculty(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFaculty();
  }, []);

  async function handleAddFaculty(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    setCreatedCredentials(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          role: 'teacher',
          department: department.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add faculty');

      setCreatedCredentials({
        name: data.user.name,
        email: data.user.email,
        password: password.trim(),
      });

      setName('');
      setEmail('');
      setPassword('demo123');

      await loadFaculty();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to remove this faculty account?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete faculty');
      await loadFaculty();
    } catch (err) {
      alert(err.message);
    }
  }

  const filtered = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell title="Faculty & Instructional Staff Directory" requiredRole="admin">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Faculty Directory
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Institutional professors, department chairs, and laboratory instructors.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="search"
            className="input"
            style={{ width: '240px', height: '40px' }}
            placeholder="Search faculty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary"
            style={{ height: '40px' }}
            onClick={() => {
              setFormError('');
              setCreatedCredentials(null);
              setModalOpen(true);
            }}
          >
            <i className="fa-solid fa-plus" />
            <span>Add Faculty</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card">Loading faculty directory...</div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <i className="fa-solid fa-chalkboard-user" />
          <p>No faculty members found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map((f) => (
            <div key={f.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#0D9488',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        fontWeight: 700,
                      }}
                    >
                      {f.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{f.name}</h3>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'monospace' }}>{f.email}</div>
                    </div>
                  </div>

                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '4px' }}>
                    Faculty
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--muted)', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Department:</span>
                    <strong style={{ color: 'var(--text)' }}>{f.department || 'Computer Applications'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Account Status:</span>
                    <span style={{ color: '#16A34A', fontWeight: 600 }}>Active</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: '#E5484D', borderColor: '#FECDD3' }}
                  onClick={() => handleDelete(f.id)}
                >
                  <i className="fa-regular fa-trash-can" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Faculty Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '92%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Add Faculty Member</h2>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--muted)' }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {createdCredentials && (
              <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px', marginBottom: '14px', fontSize: '12px', color: '#166534' }}>
                <strong>Faculty Account Created!</strong> Log in at <code>/login</code> with:<br />
                <strong>Email:</strong> {createdCredentials.email} | <strong>Password:</strong> {createdCredentials.password}
              </div>
            )}

            {formError && (
              <div className="alert alert-error" style={{ marginBottom: '14px' }}>
                <i className="fa-solid fa-circle-exclamation" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddFaculty}>
              <div className="form-group">
                <label className="form-label">Full Name &amp; Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Dr. Anand Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Faculty Institutional Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="e.g. anand.verma@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Password</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department / School</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Computer Applications"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Faculty Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

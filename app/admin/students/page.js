'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Add Student Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo123');
  const [department, setDepartment] = useState('BCA Semester IV');
  const [saving, setSaving] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [formError, setFormError] = useState('');

  async function loadStudents() {
    try {
      const res = await fetch('/api/admin/users?role=student');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch student directory');
      setStudents(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function handleAddStudent(e) {
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
          role: 'student',
          department: department.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add student');

      setCreatedCredentials({
        name: data.user.name,
        email: data.user.email,
        password: password.trim(),
      });

      setName('');
      setEmail('');
      setPassword('demo123');

      await loadStudents();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to remove this student account?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete student');
      await loadStudents();
    } catch (err) {
      alert(err.message);
    }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell title="Student Scholars Directory" requiredRole="admin">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Enrolled Students Directory
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Undergraduate scholars, registration numbers, and portal credentials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="search"
            className="input"
            style={{ width: '240px', height: '40px' }}
            placeholder="Search students..."
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
            <span>Add Student</span>
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
        <div className="card">Loading student directory...</div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <i className="fa-solid fa-user-graduate" />
          <p>No students found matching your search.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--muted)' }}>Student Scholar</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--muted)' }}>Email Address</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--muted)' }}>Class / Semester</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--muted)' }}>Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: 'var(--muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#2F6FED',
                            color: '#FFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          {s.name.slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text)' }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontSize: '13px' }}>
                      {s.email}
                    </td>
                    <td style={{ padding: '12px 18px', fontSize: '13px', color: 'var(--muted)' }}>
                      {s.department || 'BCA Semester IV'}
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>
                        Enrolled
                      </span>
                    </td>
                    <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ color: '#E5484D', borderColor: '#FECDD3' }}
                        onClick={() => handleDelete(s.id)}
                      >
                        <i className="fa-regular fa-trash-can" />
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '92%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Register Student Scholar</h2>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--muted)' }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {createdCredentials && (
              <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px', marginBottom: '14px', fontSize: '12px', color: '#166534' }}>
                <strong>Student Account Created!</strong> Log in at <code>/login</code> with:<br />
                <strong>Email:</strong> {createdCredentials.email} | <strong>Password:</strong> {createdCredentials.password}
              </div>
            )}

            {formError && (
              <div className="alert alert-error" style={{ marginBottom: '14px' }}>
                <i className="fa-solid fa-circle-exclamation" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddStudent}>
              <div className="form-group">
                <label className="form-label">Student Full Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Simran Kaur"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student Email Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="e.g. simran.kaur@student.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
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
                <label className="form-label">Academic Program / Batch</label>
                <input
                  type="text"
                  className="input"
                  placeholder="BCA Semester IV"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

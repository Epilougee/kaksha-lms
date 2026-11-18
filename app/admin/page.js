'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, facultyCount: 0, studentCount: 0, courseCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'teacher' | 'student'

  // Add User Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher'); // 'teacher' | 'student'
  const [department, setDepartment] = useState('Computer Applications');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState(null);

  async function loadUsers() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data.users || []);
      setStats(data.stats || { totalUsers: 0, facultyCount: 0, studentCount: 0, courseCount: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateUser(e) {
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
          role,
          department: department.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setCreatedCredentials({
        name: data.user.name,
        email: data.user.email,
        password: password.trim(),
        role: data.user.role,
      });

      // Clear input fields for next entry
      setName('');
      setEmail('');
      setPassword('');

      await loadUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(id, userRole) {
    if (userRole === 'admin') {
      alert('Cannot delete the primary administrator account.');
      return;
    }
    if (!confirm('Are you sure you want to remove this account? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      await loadUsers();
    } catch (err) {
      alert(err.message);
    }
  }

  function generateRandomPassword() {
    const chars = 'abcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Ksh@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AppShell title="Central Administration Console" requiredRole="admin">
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Academic Governance &amp; User Directory
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Provision faculty instructional accounts, register students, and configure access permissions.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ height: '42px', gap: '8px', padding: '0 18px' }}
          onClick={() => {
            setFormError('');
            setCreatedCredentials(null);
            setModalOpen(true);
          }}
        >
          <i className="fa-solid fa-user-plus" />
          <span>Add Faculty or Student</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total User Accounts</span>
            <div className="stat-card-icon" style={{ background: '#EBF2FE', color: '#2F6FED' }}>
              <i className="fa-solid fa-users" />
            </div>
          </div>
          <div className="stat-card-value">{stats.totalUsers}</div>
          <div className="stat-card-sub">Active collegiate identities</div>
        </div>

        <div className="card stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Faculty Members</span>
            <div className="stat-card-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
              <i className="fa-solid fa-chalkboard-user" />
            </div>
          </div>
          <div className="stat-card-value">{stats.facultyCount}</div>
          <div className="stat-card-sub">Professors &amp; lab instructors</div>
        </div>

        <div className="card stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Enrolled Scholars</span>
            <div className="stat-card-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <i className="fa-solid fa-user-graduate" />
            </div>
          </div>
          <div className="stat-card-value">{stats.studentCount}</div>
          <div className="stat-card-sub">Degree candidate students</div>
        </div>

        <div className="card stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Instructional Courses</span>
            <div className="stat-card-icon" style={{ background: '#F3E8FF', color: '#9333EA' }}>
              <i className="fa-solid fa-book" />
            </div>
          </div>
          <div className="stat-card-value">{stats.courseCount}</div>
          <div className="stat-card-sub">Core modules &amp; electives</div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {/* Directory Filter & Search Header */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: roleFilter === 'all' ? '#2F6FED' : '#F1F5F9',
                color: roleFilter === 'all' ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              All Users ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('teacher')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: roleFilter === 'teacher' ? '#2F6FED' : '#F1F5F9',
                color: roleFilter === 'teacher' ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Faculty ({stats.facultyCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('student')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: roleFilter === 'student' ? '#2F6FED' : '#F1F5F9',
                color: roleFilter === 'student' ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Students ({stats.studentCount})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="search"
              className="input"
              style={{ height: '38px', paddingLeft: '34px' }}
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <i
              className="fa-solid fa-magnifying-glass"
              style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--muted)', fontSize: '13px' }}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
            Loading institutional directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <i className="fa-solid fa-users-slash" style={{ fontSize: '36px', color: 'var(--muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>No Users Found</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>No accounts match the current filter criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Member Name</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Institutional Email</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Assigned Role</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Department / Stream</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isFaculty = u.role === 'teacher';
                  const isAdmin = u.role === 'admin';
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: isAdmin ? '#4F46E5' : isFaculty ? '#0D9488' : '#2F6FED',
                              color: '#FFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {u.name.slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px' }}>{u.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>UID #{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--text)', fontFamily: 'monospace' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '999px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            background: isAdmin ? '#EDE9FE' : isFaculty ? '#DCFCE7' : '#EBF2FE',
                            color: isAdmin ? '#6D28D9' : isFaculty ? '#15803D' : '#1D4ED8',
                          }}
                        >
                          {isAdmin ? 'Administrator' : isFaculty ? 'Faculty' : 'Student'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--muted)' }}>
                        {u.department || (isFaculty ? 'Computer Applications' : 'BCA Academic Stream')}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16A34A' }} />
                          Active
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {!isAdmin && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: '#E5484D', borderColor: '#FECDD3', padding: '4px 10px' }}
                            onClick={() => handleDeleteUser(u.id, u.role)}
                            title="Remove account"
                          >
                            <i className="fa-regular fa-trash-can" />
                            <span>Remove</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD USER MODAL                                                            */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '92%', borderRadius: '16px', padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                  Register New Collegiate Account
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  Create verified faculty or student credentials for immediate login.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '18px' }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Success Notification with Credential Card */}
            {createdCredentials && (
              <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
                  <i className="fa-solid fa-circle-check" />
                  <span>Account Successfully Provisioned!</span>
                </div>
                <div style={{ fontSize: '12px', color: '#166534', lineHeight: 1.5 }}>
                  The new <strong>{createdCredentials.role === 'teacher' ? 'Faculty Member' : 'Student'}</strong> (<strong>{createdCredentials.name}</strong>) can now log in at <code>/login</code> with:
                  <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #BBF7D0', marginTop: '6px', fontFamily: 'monospace', fontSize: '12px' }}>
                    <div><strong>Email:</strong> {createdCredentials.email}</div>
                    <div><strong>Password:</strong> {createdCredentials.password}</div>
                  </div>
                </div>
              </div>
            )}

            {formError && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                <i className="fa-solid fa-circle-exclamation" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              {/* Role Selection Pills */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Select Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setRole('teacher');
                      setDepartment('Computer Applications');
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: role === 'teacher' ? '2px solid #0D9488' : '1px solid var(--border)',
                      background: role === 'teacher' ? '#F0FDFA' : '#FFFFFF',
                      color: role === 'teacher' ? '#0D9488' : 'var(--text)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <i className="fa-solid fa-chalkboard-user" />
                    <span>Faculty (Instructor)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('student');
                      setDepartment('BCA Semester IV');
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: role === 'student' ? '2px solid #2F6FED' : '1px solid var(--border)',
                      background: role === 'student' ? '#EBF2FE' : '#FFFFFF',
                      color: role === 'student' ? '#2F6FED' : 'var(--text)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <i className="fa-solid fa-user-graduate" />
                    <span>Student (Scholar)</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" htmlFor="userName" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Full Name
                </label>
                <input
                  id="userName"
                  type="text"
                  className="input"
                  placeholder={role === 'teacher' ? 'e.g. Dr. Anand Verma' : 'e.g. Simran Kaur'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Institutional Email */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" htmlFor="userEmail" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Institutional Email Address
                </label>
                <input
                  id="userEmail"
                  type="email"
                  className="input"
                  placeholder={role === 'teacher' ? 'anand.verma@college.edu' : 'simran.kaur@student.edu'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password with generator & show toggle */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" htmlFor="userPass" style={{ fontSize: '12px', fontWeight: 700, margin: 0 }}>
                    Access Password
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setPassword('demo123')}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Use "demo123"
                    </button>
                    <span style={{ color: 'var(--border)' }}>&middot;</span>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      <i className="fa-solid fa-key" style={{ marginRight: '3px' }} />
                      Generate
                    </button>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    id="userPass"
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="Enter or generate password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                  >
                    <i className={showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'} />
                  </button>
                </div>
              </div>

              {/* Department / Stream */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" htmlFor="dept" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Department / Academic Unit
                </label>
                <input
                  id="dept"
                  type="text"
                  className="input"
                  placeholder="e.g. Computer Applications / Artificial Intelligence"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check" />
                      <span>Create {role === 'teacher' ? 'Faculty' : 'Student'} Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

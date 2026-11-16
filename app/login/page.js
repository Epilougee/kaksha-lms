'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Sign in failed.');
        setLoading(false);
        return;
      }

      if (data.user.role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/student');
      }
    } catch {
      setError('Network connection error.');
      setLoading(false);
    }
  }

  function fillDemo(demoEmail) {
    setEmail(demoEmail);
    setPassword('demo123');
    setError('');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(circle at 10% 15%, rgba(47, 111, 237, 0.08) 0%, transparent 45%),
          radial-gradient(circle at 90% 85%, rgba(15, 23, 42, 0.06) 0%, transparent 45%),
          radial-gradient(rgba(148, 163, 184, 0.28) 1.2px, transparent 1.2px),
          #F5F7FB
        `,
        backgroundSize: '100% 100%, 100% 100%, 28px 28px, 100% 100%',
      }}
    >
      {/* Background Architectural Blueprint Watermark - Top Left */}
      <svg
        style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '420px',
          height: '420px',
          opacity: 0.07,
          pointerEvents: 'none',
        }}
        viewBox="0 0 400 400"
        fill="none"
        stroke="#2F6FED"
      >
        <circle cx="200" cy="200" r="180" strokeWidth="2" strokeDasharray="6 6" />
        <circle cx="200" cy="200" r="130" strokeWidth="2" />
        <circle cx="200" cy="200" r="70" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="200" y1="0" x2="200" y2="400" strokeWidth="1.5" strokeDasharray="8 8" />
        <line x1="0" y1="200" x2="400" y2="200" strokeWidth="1.5" strokeDasharray="8 8" />
      </svg>

      {/* Background Architectural Blueprint Watermark - Bottom Right */}
      <svg
        style={{
          position: 'absolute',
          bottom: '-120px',
          right: '-120px',
          width: '480px',
          height: '480px',
          opacity: 0.06,
          pointerEvents: 'none',
        }}
        viewBox="0 0 400 400"
        fill="none"
        stroke="#0F172A"
      >
        <circle cx="200" cy="200" r="190" strokeWidth="2" />
        <circle cx="200" cy="200" r="140" strokeWidth="2" strokeDasharray="6 6" />
        <circle cx="200" cy="200" r="90" strokeWidth="2" />
        <circle cx="200" cy="200" r="40" strokeWidth="2" strokeDasharray="3 3" />
      </svg>

      {/* Main Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          display: 'flex',
          flexDirection: 'row',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(228, 233, 242, 0.8)',
          overflow: 'hidden',
          zIndex: 2,
        }}
      >
        {/* Left Column: Login Form */}
        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '18px',
                }}
              >
                <i className="fa-solid fa-graduation-cap" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text)', lineHeight: 1 }}>Kaksha</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Academic Learning Portal
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Sign In</h1>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
                Enter your institutional credentials.
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <i className="fa-solid fa-circle-exclamation" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Institutional Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  style={{ height: '44px' }}
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label" htmlFor="password" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    style={{ height: '44px', paddingRight: '40px' }}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--muted)',
                      cursor: 'pointer',
                    }}
                    aria-label="Toggle password visibility"
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: '44px', marginTop: '8px' }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <i className="fa-solid fa-arrow-right" />
              </button>
            </form>

            <div style={{ marginTop: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Quick Demo Logins (password: demo123)
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => fillDemo('teacher@demo.com')}
                >
                  Faculty (Dr. Ramesh)
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => fillDemo('student1@demo.com')}
                >
                  Student (Aarav - 90%)
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => fillDemo('student2@demo.com')}
                >
                  Student (Priya - Behind)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Collegiate Architectural Banner */}
        <div
          style={{
            flex: 0.9,
            background: 'var(--ink)',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            color: '#FFFFFF',
          }}
        >
          {/* Subtle concentric rings graphic */}
          <svg
            style={{
              position: 'absolute',
              right: '-60px',
              bottom: '-60px',
              width: '320px',
              height: '320px',
              opacity: 0.08,
              pointerEvents: 'none',
            }}
            viewBox="0 0 200 200"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="100" cy="100" r="90" strokeWidth="4" strokeDasharray="8 8" />
            <circle cx="100" cy="100" r="65" strokeWidth="3" />
            <circle cx="100" cy="100" r="40" strokeWidth="2" strokeDasharray="4 4" />
          </svg>

          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8' }}>
              Academic Portal
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', marginTop: '12px', lineHeight: 1.3 }}>
              Knowledge Delivery & Performance System
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#CBD5E1' }}>
              <i className="fa-solid fa-play" style={{ color: 'var(--primary)', width: '16px' }} />
              <span>Verified Video Lectures & Study Materials</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#CBD5E1' }}>
              <i className="fa-solid fa-video" style={{ color: 'var(--primary)', width: '16px' }} />
              <span>Integrated Scheduled Live Virtual Classes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#CBD5E1' }}>
              <i className="fa-solid fa-file-circle-check" style={{ color: 'var(--primary)', width: '16px' }} />
              <span>Assignment Submissions & Transparent Grading</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
